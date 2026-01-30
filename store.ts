
import { useState, useEffect } from 'react';
import { User, Order, UserRole, OrderStatus } from './types';
import { supabase } from './lib/supabase';

export const useStore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchProfile(session.user.id);
      setLoading(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setOrders([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    // Select profile and (optionally) courier data in one query
    const { data, error } = await supabase.from('profiles').select('*, couriers(*)').eq('id', userId).single();
    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return;
    }
    if (data) {
      // couriers is returned as an array (because of relation) — take first element if exists
      const courier = Array.isArray(data.couriers) ? data.couriers[0] : data.couriers;
      const mappedUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        phone: data.phone,
        avatarUrl: data.avatar_url,
        document: data.document,
        vehiclePlate: courier?.vehicle_plate || undefined,
        balance: Number(courier?.balance ?? 0),
        rating: Number(courier?.rating ?? 5),
        totalRatings: courier?.total_ratings ?? 0,
        isVerified: courier?.is_verified ?? false
      };
      setUser(mappedUser);
      fetchOrders(data.id, data.role as UserRole);
    }
  };

  const fetchOrders = async (userId: string, role: UserRole) => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (role === UserRole.CLIENT) {
      query = query.eq('client_id', userId);
    } else if (role === UserRole.COURIER) {
      query = query.or(`courier_id.eq.${userId},status.eq.${OrderStatus.WAITING}`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      return;
    }

    if (data) {
      setOrders(data.map(o => ({
        id: o.id,
        clientId: o.client_id,
        courierId: o.courier_id,
        packageCount: o.package_count,
        dimensions: o.dimensions,
        pickupAddresses: o.pickup_addresses,
        deliveryAddresses: o.delivery_addresses,
        distanceKm: o.distance_km,
        totalValue: Number(o.total_value),
        courierEarnings: Number(o.courier_earnings),
        status: o.status as OrderStatus,
        createdAt: o.created_at,
        clientRated: o.client_rated,
        courierRated: o.courier_rated,
        observations: o.observations
      })));
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      // If we have a valid session immediately after sign in, fetch the profile
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) await fetchProfile(session.user.id);
      } catch (e) {
        console.warn('Could not fetch session after login:', e);
      }

      return data;
    } catch (err) {
      // bubble up
      throw err;
    }
  };

  const register = async (email: string, pass: string, profile: Partial<User>) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: { data: { role: profile.role, name: profile.name } }
      });

      // Log detailed error for debugging and rethrow
      if (authError) {
        console.error('SignUp error object:', authError);
        if ((authError as any).message) console.error('SignUp error message:', (authError as any).message);
        if ((authError as any).status) console.error('SignUp status:', (authError as any).status);
        if ((authError as any).details) console.error('SignUp details:', (authError as any).details);
        throw authError;
      }

      console.log('SignUp response:', authData);

      // IMPORTANT: Avoid writing to protected tables from the client during signup.
      // RLS/policies or timing can cause "Database error creating new user" if we try to
      // insert into `profiles`/`couriers` immediately. We rely on the DB trigger to
      // create the profile automatically (and on email confirmation) — don't upsert here.

      // If signUp returned an active session (rare if email confirmation is required),
      // fetch the profile immediately so UI is in sync.
      if (authData?.user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) await fetchProfile(session.user.id);
        } catch (e) {
          console.warn('Could not fetch profile after signUp:', e);
        }
      }

      return authData;
    } catch (err) {
      // bubble the original error up so UI can show precise reason
      throw err;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    // Update common fields in profiles
    const { error: pErr } = await supabase.from('profiles').update({
      name: data.name,
      phone: data.phone,
      avatar_url: data.avatarUrl,
      email: data.email,
      document: data.document
    }).eq('id', user.id);

    if (pErr) throw pErr;

    // Update courier-specific fields in couriers (if any)
    const courierUpdates: any = {};
    if (data.vehiclePlate !== undefined) courierUpdates.vehicle_plate = data.vehiclePlate;
    if (data.balance !== undefined) courierUpdates.balance = data.balance;
    if (data.rating !== undefined) courierUpdates.rating = data.rating;
    if (data.totalRatings !== undefined) courierUpdates.total_ratings = data.totalRatings;
    if (data.isVerified !== undefined) courierUpdates.is_verified = data.isVerified;

    if (Object.keys(courierUpdates).length > 0) {
      const { error: cErr } = await supabase.from('couriers').upsert([{ id: user.id, ...courierUpdates }]);
      if (cErr) throw cErr;
    }

    setUser({ ...user, ...data });
  };

  const addOrder = async (order: Partial<Order>) => {
    if (!user) return;
    const { error } = await supabase.from('orders').insert([{
      client_id: user.id,
      package_count: order.packageCount,
      dimensions: order.dimensions,
      pickup_addresses: order.pickupAddresses,
      delivery_addresses: order.deliveryAddresses,
      distance_km: order.distanceKm,
      total_value: order.totalValue,
      courier_earnings: order.courierEarnings,
      status: OrderStatus.WAITING,
      observations: order.observations
    }]);

    if (error) throw error;
    fetchOrders(user.id, user.role);
  };

  const updateOrderStatus = async (id: string, status: OrderStatus, courierId?: string) => {
    const update: any = { status };
    if (courierId) update.courier_id = courierId;
    
    const { error } = await supabase.from('orders').update(update).eq('id', id);
    if (error) throw error;
    
    fetchOrders(user!.id, user!.role);
  };

  const rateOrder = async (orderId: string, isCourierRating: boolean, stars: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const field = isCourierRating ? { client_rated: true } : { courier_rated: true };
    const { error: orderErr } = await supabase.from('orders').update(field).eq('id', orderId);
    if (orderErr) {
      console.error('Failed to update order rating flag:', orderErr);
      throw orderErr;
    }

    const targetId = isCourierRating ? order.clientId : order.courierId;
    if (!targetId) {
      fetchOrders(user!.id, user!.role);
      return;
    }

    // Determine where to update rating
    const { data: targetProfile, error: tpErr } = await supabase.from('profiles').select('role').eq('id', targetId).single();
    if (tpErr) {
      console.error('Failed to fetch target profile for rating:', tpErr);
      throw tpErr;
    }

    try {
      if (targetProfile?.role === UserRole.COURIER) {
        const { data: p, error: pErr } = await supabase.from('couriers').select('rating, total_ratings').eq('id', targetId).single();
        if (pErr) { console.error('Failed to fetch courier data:', pErr); throw pErr; }
        const newTotal = (p.total_ratings || 0) + 1;
        const newRating = ((Number(p.rating || 5) * (p.total_ratings || 0)) + stars) / newTotal;
        const { error: uErr } = await supabase.from('couriers').update({ rating: newRating, total_ratings: newTotal }).eq('id', targetId);
        if (uErr) { console.error('Failed to update courier rating:', uErr); throw uErr; }
      } else {
        const { data: p, error: pErr } = await supabase.from('profiles').select('rating, total_ratings').eq('id', targetId).single();
        if (pErr) { console.error('Failed to fetch profile rating data:', pErr); throw pErr; }
        const newTotal = (p.total_ratings || 0) + 1;
        const newRating = ((Number(p.rating || 5) * (p.total_ratings || 0)) + stars) / newTotal;
        const { error: uErr } = await supabase.from('profiles').update({ rating: newRating, total_ratings: newTotal }).eq('id', targetId);
        if (uErr) { console.error('Failed to update profile rating:', uErr); throw uErr; }
      }
    } finally {
      fetchOrders(user!.id, user!.role);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, orders, loading, login, register, updateProfile, logout, addOrder, updateOrderStatus, rateOrder };
};

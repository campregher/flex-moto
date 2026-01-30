import { useState, useEffect } from 'react';
import { User, Order, UserRole, OrderStatus } from './types';
import { supabase } from './lib/supabase';

export const useStore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     AUTH + SESSION
  ========================== */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          if (session?.user?.id) {
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setOrders([]);
          }
        } catch (err) {
          console.error('Auth state handler error:', err);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  /* =========================
     PROFILE
  ========================== */
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, couriers(*)')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar perfil:', error);
      return;
    }

    const courier = Array.isArray(data.couriers)
      ? data.couriers[0]
      : data.couriers;

    const mappedUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      document: data.document,

      vehiclePlate: courier?.vehicle_plate,
      balance: Number(courier?.balance ?? 0),
      rating: Number(courier?.rating ?? 5),
      totalRatings: courier?.total_ratings ?? 0,
      isVerified: courier?.is_verified ?? false
    };

    setUser(mappedUser);
    await fetchOrders(mappedUser.id, mappedUser.role);
  };

  /* =========================
     ORDERS
  ========================== */
  const fetchOrders = async (userId: string, role: UserRole) => {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (role === UserRole.CLIENT) {
      query = query.eq('client_id', userId);
    }

    if (role === UserRole.COURIER) {
      // pedidos do entregador OU pedidos disponíveis
      query = query.or(
        `courier_id.eq.${userId},status.eq.${OrderStatus.WAITING}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return;
    }

    setOrders(
      (data || []).map(o => ({
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
      }))
    );
  };

  /* =========================
     AUTH ACTIONS
  ========================== */
  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) throw error;

    if (data?.user?.id) {
      await fetchProfile(data.user.id);
    }

    return data;
  };

  const register = async (
    email: string,
    pass: string,
    profile: Partial<User>
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          role: profile.role,
          name: profile.name
        }
      }
    });

    if (error) {
      const msg = String((error as any).message || '');
      const status = (error as any).status;

      if (status === 429 || /rate limit/i.test(msg)) {
        const e: any = new Error('EMAIL_RATE_LIMIT');
        e.original = error;
        throw e;
      }

      throw error;
    }

    return data;
  };

  /* =========================
     PROFILE UPDATE
  ========================== */
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    const { error: pErr } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        phone: data.phone,
        avatar_url: data.avatarUrl,
        email: data.email,
        document: data.document
      })
      .eq('id', user.id);

    if (pErr) throw pErr;

    const courierUpdates: any = {};
    if (data.vehiclePlate !== undefined)
      courierUpdates.vehicle_plate = data.vehiclePlate;
    if (data.balance !== undefined)
      courierUpdates.balance = data.balance;
    if (data.rating !== undefined)
      courierUpdates.rating = data.rating;
    if (data.totalRatings !== undefined)
      courierUpdates.total_ratings = data.totalRatings;
    if (data.isVerified !== undefined)
      courierUpdates.is_verified = data.isVerified;

    if (Object.keys(courierUpdates).length > 0) {
      const { error } = await supabase
        .from('couriers')
        .upsert([{ id: user.id, ...courierUpdates }]);
      if (error) throw error;
    }

    setUser({ ...user, ...data });
  };

  /* =========================
     ORDER ACTIONS
  ========================== */
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

    await fetchOrders(user.id, user.role);
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    courierId?: string
  ) => {
    if (!user) return;

    const update: any = { status };
    if (courierId) update.courier_id = courierId;

    const { error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', orderId);

    if (error) throw error;

    await fetchOrders(user.id, user.role);
  };

  /* =========================
     RATING
  ========================== */
  const rateOrder = async (
    orderId: string,
    isCourierRating: boolean,
    stars: number
  ) => {
    if (!user) return;

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const ratingFlag = isCourierRating
      ? { client_rated: true }
      : { courier_rated: true };

    await supabase.from('orders').update(ratingFlag).eq('id', orderId);

    const targetId = isCourierRating
      ? order.clientId
      : order.courierId;

    if (!targetId) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', targetId)
      .single();

    const table =
      profile?.role === UserRole.COURIER ? 'couriers' : 'profiles';

    const { data } = await supabase
      .from(table)
      .select('rating, total_ratings')
      .eq('id', targetId)
      .single();

    const currentRating = data?.rating ?? 5;
    const currentTotal = data?.total_ratings ?? 0;
    const newTotal = currentTotal + 1;
    const newRating =
      ((currentRating * currentTotal) + stars) / newTotal;

    await supabase
      .from(table)
      .update({
        rating: newRating,
        total_ratings: newTotal
      })
      .eq('id', targetId);

    await fetchOrders(user.id, user.role);
  };

  /* =========================
     LOGOUT
  ========================== */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
  };

  return {
    user,
    orders,
    loading,
    login,
    register,
    updateProfile,
    logout,
    addOrder,
    updateOrderStatus,
    rateOrder
  };
};

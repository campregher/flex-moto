
import React, { useState } from 'react';
import { User, Order, OrderStatus } from '../types';
import { Button } from '../components/ui/Button';
import { MapView } from '../components/MapView';
import { Package, MapPin, CheckCircle2, Star, X, Camera, Settings, MessageSquare } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';
import { STATUS_COLORS, ORDER_STATUS_LABELS } from '../constants';

interface CourierDashboardProps {
  user: User;
  orders: Order[];
  onUpdateStatus: (id: string, s: OrderStatus, cId?: string) => void;
  onUpdateProfile: (d: Partial<User>) => void;
  onRate: (id: string, stars: number) => void;
}

export const CourierDashboard: React.FC<CourierDashboardProps> = ({ user, orders, onUpdateStatus, onUpdateProfile, onRate }) => {
  const [tab, setTab] = useState<'avail' | 'active' | 'history'>('avail');
  const [showSettings, setShowSettings] = useState(false);
  const [rateOrder, setRateOrder] = useState<Order | null>(null);
  const [stars, setStars] = useState(5);

  const available = orders.filter(o => o.status === OrderStatus.WAITING);
  const active = orders.filter(o => o.courierId === user.id && o.status !== OrderStatus.FINISHED);
  const history = orders.filter(o => o.courierId === user.id && o.status === OrderStatus.FINISHED);

  const handleNextStatus = (order: Order) => {
    const sequence = [
      OrderStatus.ACCEPTED, OrderStatus.PICKING_UP, OrderStatus.COLLECTED,
      OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.FINISHED
    ];
    const next = sequence[sequence.indexOf(order.status) + 1] || order.status;
    if (next === OrderStatus.FINISHED && !order.courierRated) {
      setRateOrder(order);
    }
    onUpdateStatus(order.id, next);
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center border-b-4 border-yellow-400">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSettings(true)} className="relative">
            <img src={user.avatarUrl} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100" />
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-900 rounded-lg px-1 text-[10px] font-black">
              ★ {user.rating.toFixed(1)}
            </div>
          </button>
          <div>
            <h1 className="text-lg font-bold">{user.name.split(' ')[0]}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.vehiclePlate || 'SEM PLACA'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Ganhos</p>
          <p className="text-xl font-black text-green-600 italic">{formatCurrency(user.balance)}</p>
        </div>
      </header>

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
        {['avail', 'active', 'history'].map((t) => (
          <button key={t} onClick={() => setTab(t as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${tab === t ? 'bg-white shadow-sm text-yellow-600 scale-[1.02]' : 'text-slate-500'}`}>
            {t === 'avail' ? `Novos (${available.length})` : t === 'active' ? `Em Rota (${active.length})` : 'Histórico'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tab === 'avail' && available.map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border-l-8 border-yellow-400 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-start">
               <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">Flex {order.dimensions.width}x{order.dimensions.height}</span>
               <p className="text-2xl font-black text-slate-900 dark:text-white italic">{formatCurrency(order.courierEarnings)}</p>
            </div>
            <div className="space-y-1">
               <p className="font-bold text-sm flex items-center gap-2"><Package size={16} /> {order.packageCount} volumes p/ entrega</p>
               <p className="text-xs text-slate-500 flex items-start gap-1"><MapPin size={14} className="mt-0.5 text-red-500" /> {order.deliveryAddresses[0].address}</p>
            </div>
            <Button className="w-full h-14 text-lg font-black" onClick={() => onUpdateStatus(order.id, OrderStatus.ACCEPTED, user.id)}>ACEITAR CORRIDA</Button>
          </div>
        ))}

        {tab === 'active' && active.map(order => (
          <div key={order.id} className="space-y-4 animate-in fade-in">
            <MapView pickups={order.pickupAddresses} deliveries={order.deliveryAddresses} />
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase">ID: {order.id.slice(-6).toUpperCase()}</span>
              </div>
              <Button className="w-full h-20 text-xl font-black italic shadow-2xl shadow-yellow-400/20" onClick={() => handleNextStatus(order)}>
                {order.status === OrderStatus.ACCEPTED && 'INICIAR COLETA'}
                {order.status === OrderStatus.PICKING_UP && 'PACOTES COLETADOS'}
                {order.status === OrderStatus.COLLECTED && 'INICIAR ENTREGA'}
                {order.status === OrderStatus.IN_TRANSIT && 'CHEGUEI NO LOCAL'}
                {order.status === OrderStatus.DELIVERED && 'FINALIZAR ROTA'}
              </Button>
            </div>
          </div>
        ))}

        {tab === 'history' && history.map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] flex justify-between items-center shadow-sm border border-slate-50 dark:border-slate-700 opacity-80">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600"><CheckCircle2 size={20} /></div>
               <div>
                  <p className="text-sm font-bold">{order.packageCount} vol. entregues</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{formatDate(order.createdAt)}</p>
               </div>
            </div>
            <p className="font-black text-green-600 italic">{formatCurrency(order.courierEarnings)}</p>
          </div>
        ))}
      </div>

      {/* Avaliação do Lojista */}
      {rateOrder && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[80] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[3rem] p-8 text-center space-y-6 animate-in zoom-in">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto text-yellow-600">
               <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-black italic">Avalie o Lojista</h3>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setStars(s)} className={`transition-transform active:scale-90 ${stars >= s ? 'text-yellow-400' : 'text-slate-200'}`}>
                  <Star size={32} fill={stars >= s ? 'currentColor' : 'none'} strokeWidth={2.5} />
                </button>
              ))}
            </div>
            <Button className="w-full h-14 font-black" onClick={() => { onRate(rateOrder.id, stars); setRateOrder(null); }}>ENVIAR AVALIAÇÃO</Button>
          </div>
        </div>
      )}

      {/* Configurações Perfil */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 space-y-6 relative animate-in zoom-in">
            <button onClick={() => setShowSettings(false)} className="absolute right-6 top-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20} /></button>
            <h2 className="text-2xl font-black italic">Seu Perfil</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <label htmlFor="av-courier" className="cursor-pointer">
                  <img src={user.avatarUrl || '/avatar-placeholder.png'} className="w-24 h-24 rounded-[2.5rem] object-cover ring-4 ring-yellow-400" />
                </label>
                <input id="av-courier" type="file" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = () => onUpdateProfile({ avatarUrl: r.result as string });
                    r.readAsDataURL(f);
                  }
                }} />
                <button onClick={() => onUpdateProfile({ avatarUrl: '' })} className="mt-2 text-[12px] text-slate-500 hover:text-red-500">Remover foto</button>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Toque na foto para trocar</p>
            </div>
            <div className="space-y-4">
               <input value={user.name} onChange={e => onUpdateProfile({name: e.target.value})} placeholder="Nome" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400" />
               <input value={user.email} onChange={e => onUpdateProfile({email: e.target.value})} type="email" placeholder="Email" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400" />
               <input value={user.phone} onChange={e => onUpdateProfile({phone: e.target.value})} type="tel" placeholder="Telefone" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400" />
               <input value={user.document} onChange={e => onUpdateProfile({document: e.target.value})} placeholder="Documento (CPF/CNPJ)" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400" />
               <input value={user.vehiclePlate} onChange={e => onUpdateProfile({vehiclePlate: e.target.value})} placeholder="Placa da Moto" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400" />
               <div className="flex gap-3">
                 <Button onClick={() => setShowSettings(false)} className="flex-1 h-14">Salvar</Button>
                 <Button onClick={() => { /* revert changes by refetching user or closing */ setShowSettings(false); }} className="flex-1 h-14 bg-slate-200 text-slate-800">Cancelar</Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

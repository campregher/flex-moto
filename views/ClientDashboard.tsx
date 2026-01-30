
import React, { useState } from 'react';
import { User, Order, OrderStatus, Address } from '../types';
import { Button } from '../components/ui/Button';
import { Plus, MapPin, Search, X, Settings, Camera, Star, AlertTriangle, Package } from 'lucide-react';
import { calculateFreight, formatCurrency, formatDate } from '../utils';
import { STATUS_COLORS, ORDER_STATUS_LABELS } from '../constants';

interface ClientDashboardProps {
  user: User;
  orders: Order[];
  onAddOrder: (order: Partial<Order>) => void;
  onUpdateProfile: (data: Partial<User>) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, orders, onAddOrder, onUpdateProfile }) => {
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [packageCount, setPackageCount] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 20, height: 20 });
  const [deliveryAddr, setDeliveryAddr] = useState<Address | null>(null);
  const [search, setSearch] = useState('');

  const isTooBig = dimensions.width > 40 || dimensions.height > 40;

  const handleCreate = () => {
    if (!deliveryAddr || isTooBig) return;
    const dist = Math.floor(Math.random() * 25) + 2;
    const { totalValue, courierEarnings } = calculateFreight(packageCount, dist);
    
    onAddOrder({
      packageCount,
      dimensions,
      pickupAddresses: [{ label: 'Loja', address: 'Endereço da Loja', lat: 0, lng: 0 }],
      deliveryAddresses: [deliveryAddr],
      distanceKm: dist,
      totalValue,
      courierEarnings,
    });
    setShowModal(false);
    setDeliveryAddr(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={user.avatarUrl} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-yellow-400" />
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-900 rounded-lg px-1 text-[10px] font-black flex items-center gap-0.5">
              <Star size={8} fill="currentColor" /> {user.rating.toFixed(1)}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black">Olá, {user.name.split(' ')[0]}</h1>
            <button onClick={() => setShowSettings(true)} className="text-[10px] text-blue-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Settings size={12} /> CONFIGURAÇÕES
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(user.balance)}</p>
        </div>
      </header>

      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black italic">Suas Entregas</h2>
        <Button onClick={() => setShowModal(true)} className="rounded-2xl shadow-lg shadow-yellow-400/20">
          <Plus size={20} className="mr-1" /> NOVO PEDIDO
        </Button>
      </div>

      <div className="grid gap-4">
        {orders.filter(o => o.clientId === user.id).map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-50 dark:border-slate-700 shadow-sm transition-all hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-4">
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="font-black flex items-center gap-2">
                  <Package size={16} className="text-yellow-500" />
                  {order.packageCount} vol. ({order.dimensions.width}x{order.dimensions.height}cm)
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin size={12}/> {order.deliveryAddresses[0].address}
                </p>
              </div>
              <p className="text-xl font-black text-blue-600 italic">{formatCurrency(order.totalValue)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar Pedido */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20} /></button>
            <h2 className="text-3xl font-black mb-6 italic">Nova Entrega Flex</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-slate-400">Dimensões Máximas (40x40cm)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase">Largura: {dimensions.width}cm</p>
                    <input type="range" min="10" max="60" value={dimensions.width} onChange={e => setDimensions({...dimensions, width: Number(e.target.value)})} className="w-full accent-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase">Altura: {dimensions.height}cm</p>
                    <input type="range" min="10" max="60" value={dimensions.height} onChange={e => setDimensions({...dimensions, height: Number(e.target.value)})} className="w-full accent-blue-600" />
                  </div>
                </div>
                {isTooBig && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-xs font-bold border border-red-100">
                    <AlertTriangle size={16} /> Excede o limite de 40x40 para Moto
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-slate-400">Volumes (1 a 50)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="50" value={packageCount} onChange={e => setPackageCount(Number(e.target.value))} className="flex-1 accent-yellow-400" />
                  <span className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black">{packageCount}</span>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-slate-400">Destino</label>
                <div className="relative">
                  <Search className="absolute left-4 top-4 text-slate-300" size={20} />
                  <input placeholder="Buscar endereço..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-yellow-400" />
                  {search.length > 3 && !deliveryAddr && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-10 border border-slate-100 p-2">
                      <button onClick={() => { setDeliveryAddr({label: search, address: search, lat: 0, lng: 0}); setSearch(''); }} className="w-full p-4 text-left hover:bg-slate-50 rounded-xl font-bold text-sm flex items-center gap-2">
                        <MapPin size={16} className="text-yellow-500" /> Confirmar: "{search}"
                      </button>
                    </div>
                  )}
                </div>
                {deliveryAddr && (
                   <div className="mt-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-yellow-400/30 flex justify-between items-center animate-in fade-in">
                      <div className="flex items-center gap-3"><MapPin className="text-yellow-600" size={20}/><p className="font-bold text-sm truncate max-w-[200px]">{deliveryAddr.label}</p></div>
                      <button onClick={() => setDeliveryAddr(null)} className="text-red-500 p-1 hover:bg-red-50 rounded-lg"><X size={18} /></button>
                   </div>
                )}
              </div>

              <Button className="w-full h-20 text-xl font-black italic shadow-2xl" onClick={handleCreate} disabled={!deliveryAddr || isTooBig}>
                {isTooBig ? 'VOLUME EXCEDIDO' : 'SOLICITAR MOTOBOY'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Perfil / Settings */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 space-y-6 relative animate-in zoom-in">
            <button onClick={() => setShowSettings(false)} className="absolute right-6 top-6 p-2 bg-slate-50 dark:bg-slate-800 rounded-full"><X size={20}/></button>
            <h2 className="text-2xl font-black italic">Seu Perfil</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
                <img src={user.avatarUrl} className="w-24 h-24 rounded-[2.5rem] object-cover ring-4 ring-yellow-400" />
                <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-white" />
                </div>
                <input id="avatar-input" type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const r = new FileReader();
                    r.onload = () => onUpdateProfile({ avatarUrl: r.result as string });
                    r.readAsDataURL(file);
                  }
                }} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Clique na foto para alterar</p>
            </div>
            <div className="space-y-4">
              <input value={user.name} onChange={e => onUpdateProfile({name: e.target.value})} placeholder="Nome" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none focus:ring-2 focus:ring-yellow-400" />
              <input value={user.phone} onChange={e => onUpdateProfile({phone: e.target.value})} placeholder="WhatsApp" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none focus:ring-2 focus:ring-yellow-400" />
              <Button onClick={() => setShowSettings(false)} className="w-full h-14">SALVAR ALTERAÇÕES</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

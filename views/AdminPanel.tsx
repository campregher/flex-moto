
import React from 'react';
import { User, Order } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Truck, DollarSign, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  orders: Order[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ orders }) => {
  const totalVolume = orders.reduce((acc, curr) => acc + curr.totalValue, 0);
  const totalPackages = orders.reduce((acc, curr) => acc + curr.packageCount, 0);
  const totalEarnings = orders.reduce((acc, curr) => acc + (curr.totalValue - curr.courierEarnings), 0);
  
  const chartData = [
    { name: 'Seg', val: 400 },
    { name: 'Ter', val: 700 },
    { name: 'Qua', val: 1200 },
    { name: 'Qui', val: 900 },
    { name: 'Sex', val: 1500 },
    { name: 'Sáb', val: 1800 },
    { name: 'Dom', val: 1100 },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-black italic tracking-tighter">Painel de Controle</h1>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl text-xs font-black uppercase">
          <ShieldCheck size={16} /> Administrador
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Transacionado', val: formatCurrency(totalVolume), icon: <Activity />, color: 'bg-yellow-400 text-slate-900' },
          { label: 'Lucro Plataforma', val: formatCurrency(totalEarnings), icon: <DollarSign />, color: 'bg-green-500 text-white' },
          { label: 'Total Pacotes', val: totalPackages, icon: <Truck />, color: 'bg-blue-500 text-white' },
          { label: 'Usuários', val: '128', icon: <Users />, color: 'bg-slate-800 text-white' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-lg font-black mt-1 truncate">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-slate-400">Fluxo de Pedidos (7 dias)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="val" radius={[6, 6, 6, 6]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 ? '#fbbf24' : '#f1f5f9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-sm font-black uppercase tracking-widest">Logs de Operação</h3>
          <span className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Sincronizado
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {orders.slice(0, 10).map(o => (
                <tr key={o.id} className="text-xs hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">#{o.id.slice(0,6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[9px] font-black uppercase">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black">{formatCurrency(o.totalValue)}</td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

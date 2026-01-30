
import React, { useState } from 'react';
import { useStore } from './store';
import { UserRole } from './types';
import { Login } from './views/Login';
import { ClientDashboard } from './views/ClientDashboard';
import { CourierDashboard } from './views/CourierDashboard';
import { AdminPanel } from './views/AdminPanel';
import { LogOut, LayoutDashboard, History, ShieldAlert, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { user, orders, loading, login, register, updateProfile, logout, addOrder, updateOrderStatus, rateOrder } = useStore();
  const [activeView, setActiveView] = useState<'dash' | 'admin'>('dash');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-400">
        <Loader2 className="animate-spin text-white mb-4" size={48} />
        <p className="text-white font-black italic text-xl tracking-tighter">FLEXMOTO</p>
      </div>
    );
  }

  if (!user) return <Login onLogin={login} onRegister={register} />;

  const renderContent = () => {
    if (user.role === UserRole.ADMIN) return <AdminPanel orders={orders} />;
    
    switch (user.role) {
      case UserRole.CLIENT:
        return <ClientDashboard user={user} orders={orders} onAddOrder={addOrder} onUpdateProfile={updateProfile} />;
      case UserRole.COURIER:
        return <CourierDashboard 
          user={user} 
          orders={orders} 
          onUpdateStatus={updateOrderStatus} 
          onUpdateProfile={updateProfile}
          onRate={(id, s) => rateOrder(id, true, s)}
        />;
      default:
        return <div className="p-10 text-center">Configurando conta...</div>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen relative flex flex-col pt-4 px-4 pb-28 bg-gray-50 dark:bg-slate-950">
      <main className="flex-1">{renderContent()}</main>
      
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] px-8 py-5 flex items-center justify-between z-50">
        <button onClick={() => setActiveView('dash')} className={`flex flex-col items-center gap-1 transition-all ${activeView === 'dash' ? 'text-yellow-600 scale-110' : 'text-slate-400'}`}>
          <LayoutDashboard size={26} strokeWidth={activeView === 'dash' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Início</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <History size={26} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Histórico</span>
        </button>

        {user.role === UserRole.ADMIN && (
          <button onClick={() => setActiveView('admin')} className={`flex flex-col items-center gap-1 ${activeView === 'admin' ? 'text-blue-600' : 'text-slate-400'}`}>
            <ShieldAlert size={26} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Admin</span>
          </button>
        )}

        <div className="w-[2px] h-8 bg-slate-100 dark:bg-slate-800 rounded-full mx-2" />

        <button onClick={logout} className="flex flex-col items-center gap-1 text-red-400 transition-all hover:scale-110">
          <LogOut size={26} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Sair</span>
        </button>
      </nav>
    </div>
  );
};

export default App;

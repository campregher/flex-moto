
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Button } from '../components/ui/Button';
import { Bike, ShoppingBag, Mail, Lock, User as UserIcon, CreditCard, Smartphone, MapPin, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pword: string) => Promise<void>;
  onRegister: (email: string, pword: string, data: Partial<User>) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [step, setStep] = useState<'role' | 'auth'>('role');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CLIENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(() => {
    const v = localStorage.getItem('registrationBlockedUntil');
    return v ? parseInt(v, 10) : null;
  });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [doc, setDoc] = useState('');
  const [phone, setPhone] = useState('');
  const [plate, setPlate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // prevent registration attempts while blocked
    if (mode === 'register' && blockedUntil && blockedUntil > Date.now()) {
      setError(`Limite de envio de e-mail atingido. Tente novamente em ${Math.ceil((blockedUntil - Date.now()) / 60000)} min.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, {
          name,
          document: doc,
          phone,
          role: selectedRole,
          vehiclePlate: selectedRole === UserRole.COURIER ? plate : undefined,
        });
      }
    } catch (err: any) {
      // Handle rate limit specifically
      if (err && err.message === 'EMAIL_RATE_LIMIT') {
        const blockMs = 5 * 60 * 1000; // 5 minutes
        const until = Date.now() + blockMs;
        localStorage.setItem('registrationBlockedUntil', String(until));
        setBlockedUntil(until);
        setError('Limite de envio de e-mail atingido. Verifique sua caixa de entrada e tente novamente em 5 minutos.');
      } else {
        setError(err.message || 'Erro na autenticação. Verifique os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl space-y-8 animate-in zoom-in duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-3xl mb-2 transform -rotate-3">
              <Bike className="text-yellow-600" size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">FLEXMOTO</h1>
            <p className="text-slate-400 font-medium text-sm">Escolha como deseja acessar a plataforma</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => { setSelectedRole(UserRole.COURIER); setStep('auth'); }}
              className="w-full group flex items-center p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-yellow-400 rounded-[2rem] transition-all text-left"
            >
              <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Bike className="text-white" size={24} />
              </div>
              <div className="ml-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sou Entregador</h3>
                <p className="text-xs text-slate-400">Fazer entregas e ganhar dinheiro</p>
              </div>
            </button>

            <button 
              onClick={() => { setSelectedRole(UserRole.CLIENT); setStep('auth'); }}
              className="w-full group flex items-center p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-blue-500 rounded-[2rem] transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <div className="ml-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sou Lojista</h3>
                <p className="text-xs text-slate-400">Enviar pacotes Mercado Livre Flex</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl space-y-6 relative overflow-y-auto max-h-[90vh] hide-scrollbar">
        <button onClick={() => setStep('role')} className="absolute left-10 top-8 text-slate-400 font-bold text-xs hover:text-slate-600 flex items-center gap-1">
          ← VOLTAR
        </button>
        
        <div className="text-center pt-4">
          <h2 className="text-2xl font-black">{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
          <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest">Acesso como {selectedRole}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 animate-in shake">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-3 animate-in fade-in duration-500">
              <div className="relative">
                <UserIcon className="absolute left-4 top-4 text-slate-300" size={18} />
                <input required placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
              </div>
              <div className="relative">
                <CreditCard className="absolute left-4 top-4 text-slate-300" size={18} />
                <input required placeholder="CPF ou CNPJ" value={doc} onChange={e => setDoc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
              </div>
              <div className="relative">
                <Smartphone className="absolute left-4 top-4 text-slate-300" size={18} />
                <input required placeholder="WhatsApp" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
              </div>
              {selectedRole === UserRole.COURIER && (
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input required placeholder="Placa da Moto" value={plate} onChange={e => setPlate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
            <input required type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
            <input required type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-yellow-400 text-sm" />
          </div>

          <Button type="submit" className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-lg" isLoading={loading} disabled={mode === 'register' && blockedUntil !== null && blockedUntil > Date.now()}>
            {mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-tighter"
          >
            {mode === 'login' ? 'Não tem conta? Crie uma aqui' : 'Já tem uma conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

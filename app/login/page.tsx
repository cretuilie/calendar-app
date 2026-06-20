'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [eroare, setEroare] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/');
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEroare('');
    setMesaj('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMesaj('Cont creat! Verifica emailul pentru confirmare, apoi conecteaza-te.');
        setMode('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare necunoscuta';
      if (msg.includes('Invalid login credentials')) setEroare('Email sau parola incorecta.');
      else if (msg.includes('already registered')) setEroare('Emailul e deja inregistrat. Conecteaza-te.');
      else setEroare(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">📅</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Task Calendar Personalizat</h1>
          <p className="text-gray-500 text-sm mt-1">Taskurile tale, pe orice dispozitiv</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setEroare(''); setMesaj(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >Conectare</button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setEroare(''); setMesaj(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >Cont nou</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="adresa@email.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Parola</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Minim 6 caractere' : '••••••••'}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {eroare && <p className="text-red-600 text-sm font-medium">{eroare}</p>}
            {mesaj && <p className="text-green-600 text-sm font-medium">{mesaj}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2"
            >
              {loading ? 'Se proceseaza...' : mode === 'login' ? 'Conectare' : 'Creeaza cont'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

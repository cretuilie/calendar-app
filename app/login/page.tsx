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
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Minim 6 caractere' : '••••••••'}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900"
              />
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

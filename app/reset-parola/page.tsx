'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetParolaPage() {
  const router = useRouter();
  const [pregatit, setPregatit] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmare, setConfirmare] = useState('');
  const [loading, setLoading] = useState(false);
  const [eroare, setEroare] = useState('');
  const [gata, setGata] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPregatit(true);
    });
    // Linkul poate fi deja procesat inainte de montare
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPregatit(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEroare('');
    if (password !== confirmare) { setEroare('Parolele nu coincid.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setEroare(error.message); return; }
    setGata(true);
    setTimeout(() => router.replace('/'), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">📅</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Parola noua</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          {gata ? (
            <p className="text-green-600 text-sm font-medium">Parola a fost schimbata. Te conectam...</p>
          ) : !pregatit ? (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Deschide aceasta pagina din linkul primit pe email. Daca linkul a expirat, cere unul nou.
              </p>
              <a href="/login" className="block text-center text-sm text-indigo-600 hover:text-indigo-800 font-semibold">Inapoi la conectare</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Parola noua</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minim 8 caractere"
                  required
                  minLength={8}
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Confirma parola</label>
                <input
                  type="password"
                  value={confirmare}
                  onChange={e => setConfirmare(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900"
                />
              </div>
              {eroare && <p className="text-red-600 text-sm font-medium">{eroare}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >{loading ? 'Se proceseaza...' : 'Salveaza parola'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

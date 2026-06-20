'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Calendar from '@/components/Calendar';
import TaskList from '@/components/TaskList';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import NotificationBanner from '@/components/NotificationBanner';
import PushNotificationManager from '@/components/PushNotificationManager';
import { Task, CreateTaskData } from '@/lib/tasks';

export default function Home() {
  const router = useRouter();
  const today = new Date();
  const [token, setToken] = useState<string | null>(null);
  const [luna, setLuna] = useState(today.getMonth());
  const [an, setAn] = useState(today.getFullYear());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [dataSelectata, setDataSelectata] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [taskDeEditat, setTaskDeEditat] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStat, setExpandedStat] = useState<'all' | 'completed' | 'pending' | 'overdue' | null>(null);

  // Verifica sesiunea la mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return; }
      setToken(session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { router.replace('/login'); return; }
      setToken(session.access_token);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const apiFetch = useCallback((url: string, options?: RequestInit) => {
    if (!token) throw new Error('Neautentificat');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });
  }, [token]);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/tasks?year=${an}&month=${luna}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [token, an, luna, apiFetch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/tasks').then(r => r.json()).then(d => setAllTasks(Array.isArray(d) ? d : []));
  }, [tasks, token, apiFetch]);

  const handleSelectData = (data: string) => {
    setDataSelectata(prev => prev === data ? null : data);
  };

  const handleLunaInainte = () => {
    if (luna === 11) { setLuna(0); setAn(an + 1); }
    else setLuna(luna + 1);
  };

  const handleLunaInapoi = () => {
    if (luna === 0) { setLuna(11); setAn(an - 1); }
    else setLuna(luna - 1);
  };

  const handleSaveTask = async (data: CreateTaskData) => {
    const res = await apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Eroare salvare');
    await fetchTasks();
  };

  const handleUpdateTask = async (data: CreateTaskData) => {
    if (!taskDeEditat) return;
    const res = await apiFetch(`/api/tasks/${taskDeEditat.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...data,
        time: data.time ?? null,
        description: data.description ?? null,
        recurrence: data.recurrence ?? null,
      }),
    });
    if (!res.ok) throw new Error('Eroare actualizare');
    const updated: Task = await res.json();
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setAllTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setTaskDeEditat(null);
  };

  const handleComplete = async (id: string) => {
    await apiFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    setAllTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== id));
    setAllTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Se incarca...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h1 className="text-xl font-bold text-gray-900">Task Calendar Personalizat</h1>
          </div>
          <div className="flex items-center gap-3">
            <PushNotificationManager token={token} />
            <button
              onClick={handleSignOut}
              className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              title="Deconectare"
            >
              Iesire
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <NotificationBanner tasks={allTasks} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div>
            <Calendar
              tasks={tasks}
              dataSelectata={dataSelectata}
              onSelectData={handleSelectData}
              luna={luna}
              an={an}
              onLunaInainte={handleLunaInainte}
              onLunaInapoi={handleLunaInapoi}
            />

            {dataSelectata && !loading && (() => {
              const taskuriZi = tasks.filter(t => t.deadline === dataSelectata);
              const [y, m, d] = dataSelectata.split('-').map(Number);
              const LUNA_LUNGA = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
              const dataFormatata = `${d} ${LUNA_LUNGA[m - 1]} ${y}`;
              return (
                <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      {dataFormatata}
                      <span className="ml-2 text-xs font-normal text-gray-400">{taskuriZi.length} {taskuriZi.length === 1 ? 'task' : 'taskuri'}</span>
                    </span>
                    <button onClick={() => setDataSelectata(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                  </div>
                  {taskuriZi.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Niciun task in aceasta zi</p>
                  ) : (
                    <div className="flex flex-col gap-2 p-3 max-h-72 overflow-y-auto">
                      {[...taskuriZi].sort((a, b) => (a.time ?? '23:59').localeCompare(b.time ?? '23:59')).map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onComplete={handleComplete}
                          onDelete={handleDelete}
                          onEdit={t => setTaskDeEditat(t)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {!loading && (() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const completedTasks = tasks.filter(t => t.status === 'completed');
              const pendingTasks = tasks.filter(t => t.status === 'pending' && t.deadline >= todayStr);
              const overdueTasks = tasks.filter(t => t.status === 'pending' && t.deadline < todayStr);
              const listaVizibila = expandedStat === 'all' ? tasks
                : expandedStat === 'completed' ? completedTasks
                : expandedStat === 'pending' ? pendingTasks
                : expandedStat === 'overdue' ? overdueTasks
                : [];

              const statCard = (
                key: 'all' | 'completed' | 'pending' | 'overdue',
                count: number,
                label: string,
                colorClass: string
              ) => {
                const activ = expandedStat === key;
                return (
                  <button
                    key={key}
                    onClick={() => setExpandedStat(activ ? null : key)}
                    className={`bg-white rounded-xl border-2 p-3 text-center shadow-sm transition-all
                      ${activ ? 'border-indigo-400 shadow-md' : 'border-gray-200 hover:border-indigo-200 hover:shadow'}`}
                  >
                    <div className={`text-2xl font-bold ${colorClass}`}>{count}</div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
                    <div className="text-xs mt-1">{activ ? '▲' : '▼'}</div>
                  </button>
                );
              };

              return (
                <>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCard('all', tasks.length, 'Total luna', 'text-gray-900')}
                    {statCard('completed', completedTasks.length, 'Finalizate', 'text-green-600')}
                    {statCard('pending', pendingTasks.length, 'In asteptare', 'text-indigo-600')}
                    {statCard('overdue', overdueTasks.length, 'Intarziate', 'text-red-600')}
                  </div>

                  {expandedStat && (
                    <div className="mt-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          {expandedStat === 'all' ? 'Toate taskurile lunii' : expandedStat === 'completed' ? 'Taskuri finalizate' : expandedStat === 'overdue' ? 'Taskuri intarziate' : 'Taskuri in asteptare'}
                          <span className="ml-2 text-xs font-normal text-gray-400">{listaVizibila.length} taskuri</span>
                        </span>
                        <button onClick={() => setExpandedStat(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                      </div>
                      {listaVizibila.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Niciun task</p>
                      ) : (
                        <div className="flex flex-col gap-2 p-3 max-h-72 overflow-y-auto">
                          {[...listaVizibila].sort((a, b) => a.deadline.localeCompare(b.deadline)).map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onComplete={handleComplete}
                              onDelete={handleDelete}
                              onEdit={t => setTaskDeEditat(t)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <TaskList
            allTasks={allTasks}
            dataSelectata={dataSelectata}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEdit={task => setTaskDeEditat(task)}
            onAdauga={() => setShowForm(true)}
          />
        </div>
      </main>

      {showForm && (
        <TaskForm
          dataInitiala={dataSelectata ?? undefined}
          onSave={handleSaveTask}
          onClose={() => setShowForm(false)}
        />
      )}

      {taskDeEditat && (
        <TaskForm
          task={taskDeEditat}
          onSave={handleUpdateTask}
          onClose={() => setTaskDeEditat(null)}
        />
      )}
    </div>
  );
}

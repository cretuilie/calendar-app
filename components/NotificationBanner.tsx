'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/lib/tasks';

interface NotificationBannerProps {
  tasks: Task[];
}

function minutePanaLaDeadline(task: Task): number {
  const now = new Date();
  const deadlineDate = new Date(task.deadline + 'T' + (task.time ?? '23:59') + ':00');
  return Math.round((deadlineDate.getTime() - now.getTime()) / (1000 * 60));
}

function formatNotifyLabel(minutes: number): string {
  if (minutes >= 1440) return `${Math.round(minutes / 1440)} zile`;
  if (minutes >= 60) return `${Math.round(minutes / 60)} ore`;
  return `${minutes} min`;
}

function formatTimeLeft(minutesLeft: number): string {
  if (minutesLeft <= 0) return 'acum';
  if (minutesLeft < 60) return `${minutesLeft} min`;
  if (minutesLeft < 1440) return `${Math.round(minutesLeft / 60)} ore`;
  if (minutesLeft === 1440) return 'maine';
  return `${Math.round(minutesLeft / 1440)} zile`;
}

const LUNA_SCURTA = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatData(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${d} ${LUNA_SCURTA[m - 1]}`;
}

export default function NotificationBanner({ tasks }: NotificationBannerProps) {
  const [vizibil, setVizibil] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const pending = tasks.filter(t => t.status !== 'completed' && minutePanaLaDeadline(t) >= 0);
  const deAzi = pending.filter(t => t.deadline === todayStr);
  const urgente = deAzi.length > 0
    ? deAzi
    : (() => {
        if (pending.length === 0) return [];
        const minDeadline = pending.reduce((min, t) => t.deadline < min ? t.deadline : min, pending[0].deadline);
        return pending.filter(t => t.deadline === minDeadline);
      })();

  useEffect(() => {
    if (urgente.length > 0) setVizibil(true);
  }, [urgente.length]);

  useEffect(() => {
    if ('Notification' in window) setNotifPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (urgente.length === 0 || notifPermission !== 'granted') return;
    urgente.forEach(task => {
      const min = minutePanaLaDeadline(task);
      new Notification(`📋 ${task.title}`, {
        body: `Deadline in ${formatTimeLeft(min)}`,
        icon: '/favicon.ico',
        tag: task.id,
      });
    });
  }, [urgente.length, notifPermission]);

  const cerPermisiuneNotificari = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  };

  if (urgente.length === 0 || !vizibil) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-900 text-sm mb-2">
              {urgente.length === 1 ? '1 task cu deadline apropiat' : `${urgente.length} taskuri cu deadline apropiat`}
            </p>
            <div className="flex flex-col gap-1.5">
              {urgente.map(task => {
                const min = minutePanaLaDeadline(task);
                return (
                  <div key={task.id} className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-amber-100 text-amber-900 px-2 py-1 rounded-lg font-semibold">
                      {task.title}
                    </span>
                    <span className="text-xs text-amber-700 font-medium">
                      {formatData(task.deadline)}{task.time ? ` la ${task.time}` : ''} — ramase: <strong>{formatTimeLeft(min)}</strong>
                    </span>
                    <span className="text-xs text-amber-500">
                      (notif la {formatNotifyLabel(task.notify_days_before)} inainte)
                    </span>
                  </div>
                );
              })}
            </div>
            {notifPermission === 'default' && (
              <button
                onClick={cerPermisiuneNotificari}
                className="mt-2 text-xs text-amber-700 underline hover:text-amber-900 transition-colors"
              >
                Activeaza notificari browser →
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setVizibil(false)}
          className="w-7 h-7 rounded-lg hover:bg-amber-200 flex items-center justify-center text-amber-600 hover:text-amber-800 transition-colors shrink-0 text-lg font-bold"
        >×</button>
      </div>
    </div>
  );
}

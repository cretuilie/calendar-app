'use client';

import { useEffect, useState } from 'react';

interface Props {
  token: string | null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export default function PushNotificationManager({ token }: Props) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(ok);
    if (!ok) return;

    setPermission(Notification.permission);
    setDismissed(localStorage.getItem('push-dismissed') === '1');

    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
      );
    }
  }, []);

  const subscribe = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(sub.toJSON()),
      });

      setSubscribed(true);
    } catch (e) {
      console.error('Push subscribe error:', e);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem('push-dismissed', '1');
    setDismissed(true);
  };

  if (!supported) return null;
  if (permission === 'denied') return null;

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block shrink-0" />
        <span className="hidden sm:inline">Notificari active</span>
        <button
          onClick={unsubscribe}
          disabled={loading}
          className="text-gray-400 hover:text-red-500 transition-colors text-xs"
          title="Dezactiveaza notificarile"
        >
          Dezactiveaza
        </button>
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={subscribe}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
      >
        🔔 {loading ? 'Se activeaza...' : 'Activeaza notificari'}
      </button>
      <button
        onClick={dismiss}
        className="text-gray-400 hover:text-gray-600 text-xs transition-colors"
        title="Ignora"
      >
        ✕
      </button>
    </div>
  );
}

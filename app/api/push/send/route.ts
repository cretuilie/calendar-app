import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  'mailto:cretu.ilie@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, deadline, notify_days_before, user_id')
    .eq('status', 'pending');

  if (tasksError) return NextResponse.json({ error: tasksError.message }, { status: 500 });

  const toNotify: { user_id: string; title: string; daysLeft: number }[] = [];

  for (const task of tasks ?? []) {
    // Notify days before: daca < 1 zi (in minute), notificam in ziua deadline-ului
    const notifyDays = task.notify_days_before < 1440
      ? 0
      : Math.floor(task.notify_days_before / 1440);

    const deadlineDate = new Date(task.deadline + 'T00:00:00');
    const notifyDate = new Date(deadlineDate);
    notifyDate.setDate(notifyDate.getDate() - notifyDays);

    if (notifyDate.toISOString().split('T')[0] === todayStr) {
      const daysLeft = Math.round((deadlineDate.getTime() - today.getTime()) / 86400000);
      toNotify.push({ user_id: task.user_id, title: task.title, daysLeft });
    }
  }

  if (toNotify.length === 0) return NextResponse.json({ sent: 0 });

  // Grupeaza pe utilizator
  const byUser: Record<string, typeof toNotify> = {};
  for (const t of toNotify) {
    if (!byUser[t.user_id]) byUser[t.user_id] = [];
    byUser[t.user_id].push(t);
  }

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('user_id', Object.keys(byUser));

  let sent = 0;
  const expired: string[] = [];

  for (const sub of subs ?? []) {
    const userTasks = byUser[sub.user_id];
    if (!userTasks?.length) continue;

    const title = userTasks.length === 1
      ? `📅 ${userTasks[0].title}`
      : `📅 ${userTasks.length} taskuri azi`;

    const body = userTasks.length === 1
      ? userTasks[0].daysLeft === 0
        ? 'Deadline azi!'
        : `Deadline in ${userTasks[0].daysLeft} ${userTasks[0].daysLeft === 1 ? 'zi' : 'zile'}`
      : userTasks.map(t => t.title).join(', ');

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url: '/' }),
      );
      sent++;
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 410) {
        expired.push(sub.endpoint);
      }
    }
  }

  if (expired.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expired);
  }

  return NextResponse.json({ sent, expired: expired.length });
}

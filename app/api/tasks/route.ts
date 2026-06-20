import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase';
import { sendPushToUser } from '@/lib/push';

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  let query = supabase.from('tasks').select('*').order('deadline', { ascending: true });

  if (year && month) {
    const from = new Date(Number(year), Number(month), 1).toISOString().split('T')[0];
    const to = new Date(Number(year), Number(month) + 1, 0).toISOString().split('T')[0];
    query = query.gte('deadline', from).lte('deadline', to);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const body = await req.json();
  const { title, description, deadline, time, notify_days_before, recurrence } = body;

  if (!title || typeof title !== 'string' || title.trim().length === 0 || title.length > 200) {
    return NextResponse.json({ error: 'Titlu obligatoriu (max 200 caractere)' }, { status: 400 });
  }
  if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return NextResponse.json({ error: 'Data limita invalida' }, { status: 400 });
  }
  if (time !== undefined && time !== null && !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: 'Format ora invalid (HH:MM)' }, { status: 400 });
  }
  if (recurrence !== undefined && recurrence !== null && !['saptamanal', 'lunar', 'anual'].includes(recurrence)) {
    return NextResponse.json({ error: 'Recurenta invalida' }, { status: 400 });
  }
  const notifyMin = notify_days_before !== undefined ? Number(notify_days_before) : 20160;
  if (!Number.isInteger(notifyMin) || notifyMin < 0 || notifyMin > 525600) {
    return NextResponse.json({ error: 'Valoare notificare invalida' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      description: description ? String(description).slice(0, 1000) : null,
      deadline,
      time: time ?? null,
      notify_days_before: notifyMin,
      recurrence: recurrence ?? null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const todayStr = new Date().toISOString().split('T')[0];
  if (data.deadline === todayStr) {
    sendPushToUser(user.id, `📅 ${data.title}`, 'Task nou cu deadline azi!').catch(() => {});
  }

  return NextResponse.json(data, { status: 201 });
}

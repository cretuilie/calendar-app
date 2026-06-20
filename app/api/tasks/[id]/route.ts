import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase';
import { nextDeadline } from '@/lib/tasks';
import { sendPushToUser } from '@/lib/push';

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const supabase = createSupabaseWithToken(token);

  // Whitelist campuri permise — previne suprascrierea user_id sau altor campuri sensibile
  const allowed: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!['pending', 'completed'].includes(body.status)) {
      return NextResponse.json({ error: 'Status invalid' }, { status: 400 });
    }
    allowed.status = body.status;
  }
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0 || body.title.length > 200) {
      return NextResponse.json({ error: 'Titlu invalid' }, { status: 400 });
    }
    allowed.title = body.title.trim();
  }
  if (body.description !== undefined) allowed.description = body.description ? String(body.description).slice(0, 1000) : null;
  if (body.deadline !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.deadline)) {
      return NextResponse.json({ error: 'Data invalida' }, { status: 400 });
    }
    allowed.deadline = body.deadline;
  }
  if (body.time !== undefined) {
    if (body.time !== null && !/^\d{2}:\d{2}$/.test(body.time)) {
      return NextResponse.json({ error: 'Ora invalida' }, { status: 400 });
    }
    allowed.time = body.time;
  }
  if (body.notify_days_before !== undefined) {
    const n = Number(body.notify_days_before);
    if (!Number.isInteger(n) || n < 0 || n > 525600) {
      return NextResponse.json({ error: 'Valoare notificare invalida' }, { status: 400 });
    }
    allowed.notify_days_before = n;
  }
  if (body.recurrence !== undefined) {
    if (body.recurrence !== null && !['saptamanal', 'lunar', 'anual'].includes(body.recurrence)) {
      return NextResponse.json({ error: 'Recurenta invalida' }, { status: 400 });
    }
    allowed.recurrence = body.recurrence;
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'Niciun camp valid de actualizat' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(allowed)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trimite push daca task-ul a fost editat (nu doar marcat finalizat) si deadline-ul e azi
  const todayStr = new Date().toISOString().split('T')[0];
  const isEdit = allowed.title !== undefined || allowed.deadline !== undefined || allowed.time !== undefined;
  if (isEdit && data.deadline === todayStr && data.status === 'pending') {
    sendPushToUser(data.user_id, `📅 ${data.title}`, 'Task actualizat — deadline azi!').catch(() => {});
  }

  // Daca e marcat finalizat si are recurenta, creeaza urmatoarea aparitie
  if (body.status === 'completed' && data.recurrence) {
    await supabase.from('tasks').insert({
      title: data.title,
      description: data.description,
      deadline: nextDeadline(data.deadline, data.recurrence),
      time: data.time,
      notify_days_before: data.notify_days_before,
      recurrence: data.recurrence,
      status: 'pending',
      user_id: data.user_id,
    });
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(_req);
  if (!token) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const { id } = await params;
  const supabase = createSupabaseWithToken(token);

  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

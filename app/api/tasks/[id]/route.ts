import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase';
import { nextDeadline } from '@/lib/tasks';

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

  const { data, error } = await supabase
    .from('tasks')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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

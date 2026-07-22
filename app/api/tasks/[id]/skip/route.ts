import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase';
import { nextDeadline } from '@/lib/tasks';

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

// Sterge aceasta aparitie a unui task recurent, fara a intrerupe seria:
// urmatoarea aparitie e generata pe baza series_deadline, ca si cum ar fi fost finalizata.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const { id } = await params;
  const supabase = createSupabaseWithToken(token);

  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !task) return NextResponse.json({ error: 'Task inexistent' }, { status: 404 });
  if (!task.recurrence) return NextResponse.json({ error: 'Doar taskurile recurente pot fi sarite' }, { status: 400 });

  const { error: deleteError } = await supabase.from('tasks').delete().eq('id', id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  const baza = task.series_deadline ?? task.deadline;
  const urmatoarea = nextDeadline(baza, task.recurrence);

  const { data: nou, error: insertError } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description,
      deadline: urmatoarea,
      time: task.time,
      notify_days_before: task.notify_days_before,
      recurrence: task.recurrence,
      series_deadline: urmatoarea,
      status: 'pending',
      user_id: task.user_id,
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json(nou);
}

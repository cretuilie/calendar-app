import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase';

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

// Muta doar aceasta aparitie a unui task recurent la o alta data, fara sa atinga
// series_deadline — urmatoarele aparitii din serie raman calculate din data originala.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (!body.deadline || !/^\d{4}-\d{2}-\d{2}$/.test(body.deadline)) {
    return NextResponse.json({ error: 'Data invalida' }, { status: 400 });
  }

  const supabase = createSupabaseWithToken(token);

  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('recurrence')
    .eq('id', id)
    .single();

  if (fetchError || !task) return NextResponse.json({ error: 'Task inexistent' }, { status: 404 });
  if (!task.recurrence) return NextResponse.json({ error: 'Doar taskurile recurente pot fi amanate' }, { status: 400 });

  const { data, error } = await supabase
    .from('tasks')
    .update({ deadline: body.deadline })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

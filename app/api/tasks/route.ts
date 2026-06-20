import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase';

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

  if (!title || !deadline) {
    return NextResponse.json({ error: 'title si deadline sunt obligatorii' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      description: description ?? null,
      deadline,
      time: time ?? null,
      notify_days_before: notify_days_before ?? 20160,
      recurrence: recurrence ?? null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

import { supabase } from './supabase';

export type TaskStatus = 'pending' | 'completed';
export type Recurrence = 'saptamanal' | 'lunar' | 'anual' | null;

export interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  time: string | null;
  status: TaskStatus;
  notify_days_before: number;
  recurrence: Recurrence;
  created_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  deadline: string;
  time?: string;
  notify_days_before?: number;
  recurrence?: Recurrence;
}

export function nextDeadline(deadline: string, recurrence: Recurrence): string {
  if (!recurrence) return deadline;
  const d = new Date(deadline + 'T00:00:00');
  if (recurrence === 'saptamanal') d.setDate(d.getDate() + 7);
  else if (recurrence === 'lunar') d.setMonth(d.getMonth() + 1);
  else if (recurrence === 'anual') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTasksForMonth(year: number, month: number): Promise<Task[]> {
  const from = new Date(year, month, 1).toISOString().split('T')[0];
  const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .gte('deadline', from)
    .lte('deadline', to)
    .order('deadline', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getUpcomingDeadlines(days = 14): Promise<Task[]> {
  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  const to = limit.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .gte('deadline', from)
    .lte('deadline', to)
    .eq('status', 'pending')
    .order('deadline', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createTask(taskData: CreateTaskData): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: taskData.title,
      description: taskData.description ?? null,
      deadline: taskData.deadline,
      notify_days_before: taskData.notify_days_before ?? 14,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

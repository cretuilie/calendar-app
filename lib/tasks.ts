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

export function isOverdue(task: Task): boolean {
  if (task.status !== 'pending') return false;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (task.deadline < todayStr) return true;
  if (task.deadline === todayStr && !!task.time && task.time < nowTimeStr) return true;
  return false;
}

export function nextDeadline(deadline: string, recurrence: Recurrence): string {
  if (!recurrence) return deadline;
  const d = new Date(deadline + 'T00:00:00');
  if (recurrence === 'saptamanal') d.setDate(d.getDate() + 7);
  else if (recurrence === 'lunar') d.setMonth(d.getMonth() + 1);
  else if (recurrence === 'anual') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}


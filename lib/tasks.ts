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


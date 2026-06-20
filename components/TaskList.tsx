'use client';

import { Task } from '@/lib/tasks';
import TaskCard from './TaskCard';

interface TaskListProps {
  allTasks: Task[];
  dataSelectata: string | null;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAdauga: () => void;
}

const LUNA_LUNGA = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
const ZI_SAPTAMANA = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];

function toLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDataGrup(dateStr: string): string {
  const azi = new Date(); azi.setHours(0, 0, 0, 0);
  const d = toLocalDate(dateStr);
  const diff = Math.round((d.getTime() - azi.getTime()) / 86400000);
  const [, m, zi] = dateStr.split('-').map(Number);
  const numeLuna = LUNA_LUNGA[m - 1];
  if (diff === 0) return `Azi — ${zi} ${numeLuna}`;
  if (diff === 1) return `Maine — ${zi} ${numeLuna}`;
  return `${ZI_SAPTAMANA[d.getDay()]} — ${zi} ${numeLuna}`;
}

export default function TaskList({ allTasks, dataSelectata, onComplete, onDelete, onAdauga }: TaskListProps) {
  const azi = new Date(); azi.setHours(0, 0, 0, 0);
  const peste7 = new Date(azi); peste7.setDate(azi.getDate() + 6);

  const taskuri7Zile = allTasks
    .filter(t => {
      const d = toLocalDate(t.deadline);
      return d >= azi && d <= peste7 && t.status === 'pending';
    })
    .sort((a, b) => {
      const diff = a.deadline.localeCompare(b.deadline);
      if (diff !== 0) return diff;
      return (a.time ?? '23:59').localeCompare(b.time ?? '23:59');
    });

  // Grupeaza pe date
  const grupate: Record<string, Task[]> = {};
  taskuri7Zile.forEach(t => {
    if (!grupate[t.deadline]) grupate[t.deadline] = [];
    grupate[t.deadline].push(t);
  });
  const dateOrdonate = Object.keys(grupate).sort();

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900">Urmatoarele 7 zile</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {taskuri7Zile.length === 0
              ? 'Niciun task'
              : `${taskuri7Zile.length} task${taskuri7Zile.length > 1 ? 'uri' : ''} pending`}
          </p>
        </div>
        <button
          onClick={onAdauga}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          <span>Task nou</span>
        </button>
      </div>

      {taskuri7Zile.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-400 py-10">
          <span className="text-5xl">🎉</span>
          <p className="text-sm font-medium text-center">Niciun task in urmatoarele 7 zile</p>
          <button
            onClick={onAdauga}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors"
          >
            + Adauga task nou
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
          {dateOrdonate.map(data => (
            <div key={data}>
              <p className={`text-xs font-bold mb-2 uppercase tracking-wide
                ${data === new Date().toISOString().split('T')[0]
                  ? 'text-indigo-600'
                  : 'text-gray-500'}`}>
                {formatDataGrup(data)}
              </p>
              <div className="flex flex-col gap-2">
                {grupate[data].map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onComplete}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

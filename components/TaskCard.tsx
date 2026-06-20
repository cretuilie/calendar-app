'use client';

import { Task } from '@/lib/tasks';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const LUNA_SCURTA = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatData(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${LUNA_SCURTA[m - 1]} ${y}`;
}

function zilePanaLaDeadline(deadline: string): number {
  const azi = new Date();
  azi.setHours(0, 0, 0, 0);
  const d = new Date(deadline + 'T00:00:00');
  return Math.round((d.getTime() - azi.getTime()) / (1000 * 60 * 60 * 24));
}

export default function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
  const zile = zilePanaLaDeadline(task.deadline);
  const intarziat = zile < 0 && task.status === 'pending';
  const completed = task.status === 'completed';

  return (
    <div className={`rounded-xl border-2 p-4 transition-all duration-200
      ${completed ? 'border-green-300 bg-green-50' :
        intarziat ? 'border-red-300 bg-red-50' :
        'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'}`}>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm leading-snug
            ${completed ? 'line-through text-gray-400' : intarziat ? 'text-red-900' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-xs mt-1 leading-relaxed ${completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full
              ${completed ? 'bg-green-100 text-green-800' :
                intarziat ? 'bg-red-100 text-red-800' :
                zile === 0 ? 'bg-orange-100 text-orange-800' :
                zile <= 7 ? 'bg-amber-100 text-amber-800' :
                'bg-indigo-50 text-indigo-700'}`}>
              {completed ? 'Finalizat' :
               intarziat ? `Intarziat ${Math.abs(zile)}z` :
               zile === 0 ? 'Azi!' :
               zile === 1 ? 'Maine' :
               `${zile} zile`}
            </span>
            <span className="text-xs text-gray-600 font-medium">{formatData(task.deadline)}</span>
            {task.time && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {task.time}
              </span>
            )}
            {task.recurrence && (
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                {task.recurrence === 'saptamanal' ? '🔁 saptamanal' : task.recurrence === 'lunar' ? '🔁 lunar' : '🔁 anual'}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          {!completed && (
            <button
              onClick={() => onComplete(task.id)}
              className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center text-sm font-bold transition-colors shadow-sm"
              title="Marcheaza ca finalizat"
            >✓</button>
          )}
          <button
            onClick={() => onEdit(task)}
            className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 flex items-center justify-center transition-colors"
            title="Editeaza task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-500 hover:text-red-600 flex items-center justify-center text-base font-bold transition-colors"
            title="Sterge task"
          >×</button>
        </div>
      </div>
    </div>
  );
}

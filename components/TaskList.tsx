'use client';

import { Task } from '@/lib/tasks';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  dataSelectata: string | null;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAdauga: () => void;
}

const LUNA_LUNGA = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

function formatDataLung(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${LUNA_LUNGA[m - 1]} ${y}`;
}

export default function TaskList({ tasks, dataSelectata, onComplete, onDelete, onAdauga }: TaskListProps) {
  const taskuriZi = dataSelectata
    ? tasks.filter(t => t.deadline === dataSelectata)
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900">
            {dataSelectata ? formatDataLung(dataSelectata) : 'Selecteaza o zi'}
          </h2>
          {dataSelectata && (
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              {taskuriZi.length === 0 ? 'Niciun task' : `${taskuriZi.length} task${taskuriZi.length > 1 ? 'uri' : ''}`}
            </p>
          )}
        </div>
        {dataSelectata && (
          <button
            onClick={onAdauga}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            <span>Task nou</span>
          </button>
        )}
      </div>

      {!dataSelectata && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium">
          Clic pe o zi din calendar
        </div>
      )}

      {dataSelectata && taskuriZi.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <span className="text-5xl">📋</span>
          <p className="text-sm font-medium">Niciun task pentru aceasta zi</p>
          <button
            onClick={onAdauga}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors"
          >
            + Adauga primul task
          </button>
        </div>
      )}

      {taskuriZi.length > 0 && (
        <div className="flex flex-col gap-3 overflow-y-auto">
          {taskuriZi.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { Task } from '@/lib/tasks';

const ZI_SCURTA = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];
const LUNA_LUNGA = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

function getZileLuna(an: number, luna: number) {
  const ultimaZi = new Date(an, luna + 1, 0);
  const primaZi = new Date(an, luna, 1);
  const zile = [];
  for (let d = 1; d <= ultimaZi.getDate(); d++) {
    zile.push(new Date(an, luna, d));
  }
  const offsetLuni = (primaZi.getDay() + 6) % 7;
  return { zile, offsetLuni };
}

function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface CalendarProps {
  tasks: Task[];
  dataSelectata: string | null;
  onSelectData: (data: string) => void;
  luna: number;
  an: number;
  onLunaInainte: () => void;
  onLunaInapoi: () => void;
}

export default function Calendar({ tasks, dataSelectata, onSelectData, luna, an, onLunaInainte, onLunaInapoi }: CalendarProps) {
  const azi = new Date();
  const { zile, offsetLuni } = getZileLuna(an, luna);

  const lunaMax = new Date(azi.getFullYear(), azi.getMonth() + 24, 1);
  const poateMergeInainte = new Date(an, luna + 1, 1) < lunaMax;
  const poateMergeInapoi = !(an === azi.getFullYear() && luna === azi.getMonth());

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    acc[t.deadline] = acc[t.deadline] ?? [];
    acc[t.deadline].push(t);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      {/* Header navigare */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onLunaInapoi}
          disabled={!poateMergeInapoi}
          className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold"
        >‹</button>
        <span className="font-bold text-gray-900 text-lg tracking-tight">
          {LUNA_LUNGA[luna]} {an}
        </span>
        <button
          onClick={onLunaInainte}
          disabled={!poateMergeInainte}
          className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold"
        >›</button>
      </div>

      {/* Header zile saptamana */}
      <div className="grid grid-cols-7 mb-2">
        {ZI_SCURTA.map((z) => (
          <div key={z} className="text-center text-xs font-bold text-gray-500 py-1">{z}</div>
        ))}
      </div>

      {/* Grid zile */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offsetLuni }).map((_, i) => <div key={`e-${i}`} />)}

        {zile.map((zi, i) => {
          const dateStr = toLocalDateString(zi);
          const esteAzi = toLocalDateString(zi) === toLocalDateString(azi);
          const selectata = dataSelectata === dateStr;
          const taskuriZi = tasksByDate[dateStr] ?? [];
          const arePending = taskuriZi.some(t => t.status === 'pending');
          const areCompleted = taskuriZi.some(t => t.status === 'completed');
          const areIntarziate = taskuriZi.some(t => t.status === 'pending' && t.deadline < toLocalDateString(azi));

          return (
            <button
              key={i}
              onClick={() => onSelectData(dateStr)}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all duration-200
                ${selectata
                  ? 'bg-indigo-600 text-white shadow-md scale-105'
                  : esteAzi
                  ? 'border-2 border-indigo-500 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                  : areIntarziate
                  ? 'border-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'hover:bg-gray-100 border-2 border-transparent text-gray-800'}`}
            >
              <span>{zi.getDate()}</span>
              {taskuriZi.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {areIntarziate && <span className={`w-1.5 h-1.5 rounded-full ${selectata ? 'bg-red-300' : 'bg-red-500'}`} />}
                  {arePending && !areIntarziate && <span className={`w-1.5 h-1.5 rounded-full ${selectata ? 'bg-blue-200' : 'bg-blue-500'}`} />}
                  {areCompleted && <span className={`w-1.5 h-1.5 rounded-full ${selectata ? 'bg-green-300' : 'bg-green-400'}`} />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 font-medium">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Pending</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Finalizat</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Intarziat</span>
      </div>
    </div>
  );
}

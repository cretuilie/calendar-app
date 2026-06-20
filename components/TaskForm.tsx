'use client';

import { useState } from 'react';
import { CreateTaskData, Recurrence } from '@/lib/tasks';

interface TaskFormProps {
  dataInitiala?: string;
  onSave: (data: CreateTaskData) => Promise<void>;
  onClose: () => void;
}

const ORE = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTE = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

type NotifyUnit = 'zile' | 'ore' | 'minute';

const NOTIFY_OPTIONS: { unit: NotifyUnit; label: string }[] = [
  { unit: 'zile', label: 'Zile' },
  { unit: 'ore', label: 'Ore' },
  { unit: 'minute', label: 'Minute' },
];

function toMinutes(value: number, unit: NotifyUnit): number {
  if (unit === 'zile') return value * 24 * 60;
  if (unit === 'ore') return value * 60;
  return value;
}

export default function TaskForm({ dataInitiala, onSave, onClose }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(dataInitiala ?? '');
  const [ora, setOra] = useState('09');
  const [minut, setMinut] = useState('00');
  const [areOra, setAreOra] = useState(false);
  const [notifyValue, setNotifyValue] = useState(14);
  const [notifyUnit, setNotifyUnit] = useState<NotifyUnit>('zile');
  const [recurrence, setRecurrence] = useState<Recurrence>(null);
  const [loading, setLoading] = useState(false);
  const [eroare, setEroare] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const maxNotifyValue = notifyUnit === 'zile' ? 30 : notifyUnit === 'ore' ? 23 : 55;
  const stepNotifyValue = notifyUnit === 'minute' ? 5 : 1;

  const handleUnitChange = (unit: NotifyUnit) => {
    setNotifyUnit(unit);
    if (unit === 'zile') setNotifyValue(14);
    else if (unit === 'ore') setNotifyValue(3);
    else setNotifyValue(30);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setEroare('Titlul este obligatoriu'); return; }
    if (!deadline) { setEroare('Data limita este obligatorie'); return; }
    setLoading(true);
    setEroare('');
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        deadline,
        time: areOra ? `${ora}:${minut}` : undefined,
        notify_days_before: toMinutes(notifyValue, notifyUnit),
        recurrence,
      });
      onClose();
    } catch {
      setEroare('Eroare la salvare. Incearca din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Task nou</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors text-xl font-light">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Titlu *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Predare proiect, Intalnire client..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder-gray-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Descriere</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalii optionale..."
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900 placeholder-gray-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Data limita *</label>
            <input
              type="date"
              value={deadline}
              min={today}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none transition-colors text-sm text-gray-900"
            />
          </div>

          {/* Ora si minute */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-800">Ora</label>
              <button
                type="button"
                onClick={() => setAreOra(!areOra)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${areOra ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {areOra ? 'Activa' : 'Adauga ora'}
              </button>
            </div>
            {areOra && (
              <div className="flex gap-2 items-center">
                <select
                  value={ora}
                  onChange={e => setOra(e.target.value)}
                  className="flex-1 px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-semibold text-gray-900 bg-white"
                >
                  {ORE.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-xl font-bold text-gray-700">:</span>
                <select
                  value={minut}
                  onChange={e => setMinut(e.target.value)}
                  className="flex-1 px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none text-sm font-semibold text-gray-900 bg-white"
                >
                  {MINUTE.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-3 rounded-xl min-w-[60px] text-center">
                  {ora}:{minut}
                </span>
              </div>
            )}
          </div>

          {/* Notificare */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Notifica inainte de deadline</label>

            {/* Toggle unitati */}
            <div className="flex rounded-xl border-2 border-gray-300 overflow-hidden mb-3">
              {NOTIFY_OPTIONS.map(({ unit, label }) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => handleUnitChange(unit)}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors
                    ${notifyUnit === unit
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Valoare + preview */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={notifyUnit === 'minute' ? 5 : 0}
                max={maxNotifyValue}
                step={stepNotifyValue}
                value={notifyValue}
                onChange={e => setNotifyValue(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg min-w-[70px] text-center">
                {notifyValue === 0 ? 'aceeasi zi' : `${notifyValue} ${notifyUnit}`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{notifyUnit === 'minute' ? '5 min' : notifyUnit === 'zile' ? 'aceeasi zi' : '0 ore'}</span>
              <span>{maxNotifyValue} {notifyUnit}</span>
            </div>
          </div>

          {/* Recurenta */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Repetare</label>
            <div className="grid grid-cols-4 gap-2">
              {([null, 'saptamanal', 'lunar', 'anual'] as Recurrence[]).map(r => (
                <button
                  key={r ?? 'niciodata'}
                  type="button"
                  onClick={() => setRecurrence(r)}
                  className={`py-2 px-1 rounded-xl border-2 text-xs font-semibold transition-colors
                    ${recurrence === r
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'}`}
                >
                  {r === null ? 'Niciodata' : r === 'saptamanal' ? 'Saptamanal' : r === 'lunar' ? 'Lunar' : 'Anual'}
                </button>
              ))}
            </div>
            {recurrence && (
              <p className="text-xs text-indigo-600 font-medium mt-1.5">
                La finalizare se va crea automat urmatoarea aparitie ({recurrence}).
              </p>
            )}
          </div>

          {eroare && <p className="text-red-600 text-sm font-medium">{eroare}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Anuleaza
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Se salveaza...' : 'Salveaza task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

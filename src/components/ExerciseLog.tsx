import { useState } from 'react';
import { Plus, Trash2, Flame, Timer } from 'lucide-react';
import { EXERCISE_TYPES, calculateCaloriesBurned, type ExerciseEntry } from '../hooks/useExercise';
import { sanitizeText, clampNumber } from '../utils/validation';

interface ExerciseLogProps {
  entries: ExerciseEntry[];
  todayBurned: number;
  userWeight: number;
  onAdd: (data: { type: string; name: string; duration_min: number; calories_burned: number }) => void;
  onDelete: (id: string) => void;
}

export default function ExerciseLog({ entries, todayBurned, userWeight, onAdd, onDelete }: ExerciseLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('walking');
  const [duration, setDuration] = useState('30');
  const [customName, setCustomName] = useState('');

  const todayEntries = entries.filter((e) => e.date === new Date().toISOString().split('T')[0]);

  const estimatedCalories = calculateCaloriesBurned(selectedType, parseInt(duration) || 0, userWeight);

  const handleSubmit = () => {
    const dur = clampNumber(duration, 1, 480); // 1 min to 8 hours max
    if (dur <= 0) return;
    const exercise = EXERCISE_TYPES.find((e) => e.id === selectedType);
    onAdd({
      type: selectedType,
      name: sanitizeText(customName) || exercise?.label || selectedType,
      duration_min: dur,
      calories_burned: calculateCaloriesBurned(selectedType, dur, userWeight),
    });
    setShowForm(false);
    setCustomName('');
    setDuration('30');
  };

  return (
    <div className="card rounded-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] font-semibold">Exercise</span>
        </div>
        {todayBurned > 0 && (
          <span className="text-sm font-bold text-orange-400 tabular-nums">-{todayBurned} cal burned</span>
        )}
      </div>

      {/* Today's exercises */}
      {todayEntries.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {todayEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-hover)]">
              <div className="flex items-center gap-2">
                <span className="text-sm">{EXERCISE_TYPES.find((e) => e.id === entry.type)?.icon || '🔥'}</span>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">{entry.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{entry.duration_min} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-orange-400 tabular-nums">-{entry.calories_burned}</span>
                <button onClick={() => onDelete(entry.id)} className="p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add exercise form */}
      {showForm ? (
        <div className="space-y-3 border-t border-[var(--border-color)] pt-4">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-semibold">Choose exercise</p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
            {EXERCISE_TYPES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setSelectedType(ex.id)}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[10px] transition-all ${
                  selectedType === ex.id
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-transparent'
                }`}
              >
                <span className="text-base">{ex.icon}</span>
                <span className="font-semibold">{ex.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="300"
              className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 tabular-nums"
            />
          </div>

          <div className="bg-[var(--bg-hover)] rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Estimated burn</span>
            <span className="text-sm font-bold text-orange-400 tabular-nums">~{estimatedCalories} cal</span>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-muted)]">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!duration || parseInt(duration) <= 0}
              className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-30 transition-colors"
            >
              Log Exercise
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[var(--border-color)] text-sm text-[var(--text-muted)] hover:border-orange-400 hover:text-orange-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Exercise
        </button>
      )}
    </div>
  );
}

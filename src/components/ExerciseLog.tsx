import { useState } from 'react';
import { Plus, Trash2, Flame, Check } from 'lucide-react';
import { EXERCISE_TYPES, calculateCaloriesBurned, type ExerciseEntry } from '../hooks/useExercise';
import { sanitizeText, clampNumber } from '../utils/validation';

interface ExerciseLogProps {
  entries: ExerciseEntry[];
  todayBurned: number;
  userWeight: number;
  onAdd: (data: { type: string; name: string; duration_min: number; calories_burned: number }) => void;
  onDelete: (id: string) => void;
}

interface SelectedExercise {
  typeId: string;
  duration: string;
  customName: string;
}

export default function ExerciseLog({ entries, todayBurned, userWeight, onAdd, onDelete }: ExerciseLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);

  const todayEntries = entries.filter((e) => e.date === new Date().toISOString().split('T')[0]);

  const toggleExercise = (typeId: string) => {
    setSelectedExercises((prev) => {
      const exists = prev.find((e) => e.typeId === typeId);
      if (exists) {
        const updated = prev.filter((e) => e.typeId !== typeId);
        if (activeDetail === typeId) setActiveDetail(null);
        return updated;
      } else {
        setActiveDetail(typeId);
        return [...prev, { typeId, duration: '30', customName: '' }];
      }
    });
  };

  const updateExercise = (typeId: string, field: 'duration' | 'customName', value: string) => {
    setSelectedExercises((prev) =>
      prev.map((e) => (e.typeId === typeId ? { ...e, [field]: value } : e))
    );
  };

  const removeExercise = (typeId: string) => {
    setSelectedExercises((prev) => prev.filter((e) => e.typeId !== typeId));
    if (activeDetail === typeId) setActiveDetail(null);
  };

  const totalCalories = selectedExercises.reduce((sum, ex) => {
    const dur = parseInt(ex.duration) || 0;
    return sum + calculateCaloriesBurned(ex.typeId, dur, userWeight);
  }, 0);

  const handleSubmit = async () => {
    for (const ex of selectedExercises) {
      const dur = clampNumber(ex.duration, 1, 480);
      if (dur <= 0) continue;
      const exerciseType = EXERCISE_TYPES.find((e) => e.id === ex.typeId);
      await onAdd({
        type: ex.typeId,
        name: sanitizeText(ex.customName) || exerciseType?.label || ex.typeId,
        duration_min: dur,
        calories_burned: calculateCaloriesBurned(ex.typeId, dur, userWeight),
      });
    }
    setSelectedExercises([]);
    setActiveDetail(null);
    setShowForm(false);
  };

  return (
    <div className="card rounded-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] font-bold">Exercise</span>
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
          {/* Step 1: Multi-select exercises */}
          <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-semibold">
            {selectedExercises.length > 0
              ? `${selectedExercises.length} exercise${selectedExercises.length > 1 ? 's' : ''} selected`
              : 'Tap exercises to select (you can pick multiple)'}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
            {EXERCISE_TYPES.map((ex) => {
              const isSelected = selectedExercises.some((e) => e.typeId === ex.id);
              return (
                <button
                  key={ex.id}
                  onClick={() => toggleExercise(ex.id)}
                  className={`relative flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[10px] transition-all ${
                    isSelected
                      ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-400 shadow-sm shadow-orange-400/20'
                      : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-transparent'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-orange-400 flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                  <span className="text-base">{ex.icon}</span>
                  <span className="font-semibold">{ex.label}</span>
                </button>
              );
            })}
          </div>

          {/* Step 2: Duration + name for each selected exercise */}
          {selectedExercises.length > 0 && (
            <div className="space-y-2 mt-2">
              {selectedExercises.map((sel) => {
                const exType = EXERCISE_TYPES.find((e) => e.id === sel.typeId);
                const isOpen = activeDetail === sel.typeId;
                const cal = calculateCaloriesBurned(sel.typeId, parseInt(sel.duration) || 0, userWeight);
                return (
                  <div key={sel.typeId} className="rounded-lg border border-[var(--border-color)] overflow-hidden">
                    <button
                      onClick={() => setActiveDetail(isOpen ? null : sel.typeId)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{exType?.icon}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{exType?.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">{sel.duration} min</span>
                        <span className="text-xs font-bold text-orange-400">~{cal} cal</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeExercise(sel.typeId); }}
                          className="p-1 text-[var(--text-muted)] hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-3 py-2.5 space-y-2 bg-[var(--bg-main)]">
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] mb-1 block">Duration (minutes)</label>
                          <input
                            type="number"
                            value={sel.duration}
                            onChange={(e) => updateExercise(sel.typeId, 'duration', e.target.value)}
                            min="1"
                            max="480"
                            className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-orange-400/50 tabular-nums"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] mb-1 block">Custom name (optional)</label>
                          <input
                            type="text"
                            value={sel.customName}
                            onChange={(e) => updateExercise(sel.typeId, 'customName', e.target.value)}
                            placeholder={exType?.label}
                            className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none focus:border-orange-400/50"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Total + actions */}
          {selectedExercises.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-400">Total Burn</span>
              <span className="text-sm font-bold text-orange-400 tabular-nums">~{totalCalories} cal</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setSelectedExercises([]); setActiveDetail(null); }}
              className="flex-1 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-muted)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedExercises.length === 0}
              className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-30 transition-colors"
            >
              Log {selectedExercises.length > 0 ? `${selectedExercises.length} Exercise${selectedExercises.length > 1 ? 's' : ''}` : 'Exercise'}
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

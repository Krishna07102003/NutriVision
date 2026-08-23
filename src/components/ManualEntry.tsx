import { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import { sanitizeText, clampNumber } from '../utils/validation';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', emoji: '☕' },
  { value: 'lunch', label: 'Lunch', emoji: '🍛' },
  { value: 'dinner', label: 'Dinner', emoji: '🍲' },
  { value: 'snack_am', label: 'Snacks', emoji: '🍪' },
];

interface ManualEntryProps {
  onSubmit: (data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string; mealType: string }) => void;
  onClose: () => void;
  initialMealType?: string;
}

export default function ManualEntry({ onSubmit, onClose, initialMealType = 'breakfast' }: ManualEntryProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [serving, setServing] = useState('');
  const [mealType, setMealType] = useState(initialMealType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeName = sanitizeText(name.trim());
    if (!safeName) return;
    onSubmit({
      name: safeName,
      calories: clampNumber(calories, 0, 4999),
      protein: clampNumber(protein, 0, 500),
      carbs: clampNumber(carbs, 0, 1000),
      fat: clampNumber(fat, 0, 500),
      serving: sanitizeText(serving.trim()) || 'custom',
      mealType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center px-4" style={{ paddingTop: 'max(3rem, calc(env(safe-area-inset-top) + 2rem))' }} onClick={onClose}>
      <div className="w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-accent" />
            <h3 className="text-sm text-[var(--text-primary)] font-bold">Add food manually</h3>
          </div>
          <button onClick={onClose}>
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Meal Type Selector */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Meal</label>
            <div className="grid grid-cols-4 gap-1.5">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  type="button"
                  onClick={() => setMealType(mt.value)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                    mealType === mt.value
                      ? 'bg-accent text-white border-2 border-accent shadow-md shadow-accent/20'
                      : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border-2 border-transparent hover:border-[var(--border-color)]'
                  }`}
                >
                  <span className="text-base">{mt.emoji}</span>
                  <span>{mt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Food name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2 Roti with Dal"
              maxLength={200}
              className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Serving (optional)</label>
            <input
              type="text"
              value={serving}
              onChange={(e) => setServing(e.target.value)}
              placeholder="e.g. 1 plate, 1 bowl"
              maxLength={100}
              className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Calories *</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                min="0" max="4999"
                className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                min="0" max="500"
                className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Carbs (g)</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
                min="0" max="1000"
                className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Fat (g)</label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
                min="0" max="500"
                className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 tabular-nums"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-accent hover:bg-accent-dim disabled:bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm font-bold py-3 rounded-lg transition-colors"
          >
            Add to {MEAL_TYPES.find(m => m.value === mealType)?.label || 'meal'}
          </button>
        </form>
      </div>
    </div>
  );
}

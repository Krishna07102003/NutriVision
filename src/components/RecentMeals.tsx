import { useState } from 'react';
import { Clock, Plus } from 'lucide-react';

interface FoodToAdd {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  mealType?: string;
}

interface RecentMealsProps {
  recent: FoodToAdd[];
  onAdd: (food: FoodToAdd) => void;
}

const MEAL_OPTIONS = [
  { value: 'breakfast', label: 'Breakfast', emoji: '☕' },
  { value: 'lunch', label: 'Lunch', emoji: '🍛' },
  { value: 'dinner', label: 'Dinner', emoji: '🍲' },
  { value: 'snack_am', label: 'Snacks', emoji: '🍪' },
];

export default function RecentMeals({ recent, onAdd }: RecentMealsProps) {
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const last3 = recent.slice(0, 3);

  if (last3.length === 0) return null;

  const handleAdd = (food: FoodToAdd) => {
    if (food.mealType) {
      // Already has a meal type — add directly
      onAdd(food);
    } else {
      // No meal type — show picker
      setPickerFor(last3.indexOf(food));
    }
  };

  const handlePickMeal = (food: FoodToAdd, mealType: string) => {
    setPickerFor(null);
    onAdd({ ...food, mealType });
  };

  return (
    <div className="card rounded-card p-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-accent" />
        <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-semibold">Recent Meals</span>
      </div>
      <div className="space-y-1">
        {last3.map((food, i) => (
          <div key={`${food.name}-${i}`}>
            <button
              onClick={() => handleAdd(food)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--bg-hover)] transition-colors rounded-lg text-left group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--text-primary)] font-bold truncate">{food.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{food.serving}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-xs text-[var(--text-muted)] tabular-nums">{food.calories} cal</span>
                <Plus className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Inline meal type picker */}
            {pickerFor === i && (
              <div className="flex gap-1.5 px-2 py-2 mt-1 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                {MEAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handlePickMeal(food, opt.value)}
                    className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <span className="text-base">{opt.emoji}</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-semibold">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

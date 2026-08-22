import { Clock, Plus } from 'lucide-react';

interface FoodToAdd {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface RecentMealsProps {
  recent: FoodToAdd[];
  onAdd: (food: FoodToAdd) => void;
}

export default function RecentMeals({ recent, onAdd }: RecentMealsProps) {
  const last3 = recent.slice(0, 3);

  if (last3.length === 0) return null;

  return (
    <div className="card rounded-card p-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-accent" />
        <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-semibold">Recent Meals</span>
      </div>
      <div className="space-y-1">
        {last3.map((food, i) => (
          <button
            key={`${food.name}-${i}`}
            onClick={() => onAdd(food)}
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
        ))}
      </div>
    </div>
  );
}

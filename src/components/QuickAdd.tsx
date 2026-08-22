import { Star, StarOff, Plus } from 'lucide-react';
import type { FavoriteFood } from '../types';

interface FoodToAdd {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface QuickAddProps {
  recent: FoodToAdd[];
  favorites: FavoriteFood[];
  onAdd: (food: FoodToAdd) => void;
  onToggleFavorite: (food: FoodToAdd) => void;
  onRemoveFavorite: (id: string) => void;
  isFavorite: (name: string) => boolean;
}

export default function QuickAdd({ recent, favorites, onAdd, onToggleFavorite, onRemoveFavorite, isFavorite }: QuickAddProps) {
  const FoodRow = ({ food, showFav, favId }: { food: FoodToAdd; showFav?: boolean; favId?: string }) => (
    <button
      onClick={() => onAdd(food)}
      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--bg-hover)] transition-colors rounded-lg text-left group"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--text-primary)] font-bold truncate">{food.name}</p>
        <p className="text-[10px] text-[var(--text-muted)]">{food.serving}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="text-xs text-[var(--text-muted)] tabular-nums">{food.calories} cal</span>
        {showFav && (
          <button
            onClick={(e) => { e.stopPropagation(); if (favId) onRemoveFavorite(favId); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <StarOff className="w-3 h-3 text-[var(--text-muted)]" />
          </button>
        )}
        <Plus className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );

  const hasContent = favorites.length > 0;
  if (!hasContent) return null;

  return (
    <div className="card rounded-card p-5">
      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
            <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-semibold">Favorites</span>
          </div>
          <div className="space-y-0.5">
            {favorites.map((f) => (
              <FoodRow key={f.id} food={{ name: f.name, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat, serving: f.serving }} showFav favId={f.id} />
            ))}
          </div>
        </div>
      )}


    </div>
  );
}

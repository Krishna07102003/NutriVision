import { useState } from 'react';
import { Camera, Plus, ChevronDown, ChevronUp, Image, Search } from 'lucide-react';
import type { NutritionEntry } from '../types';
import MealCard from './MealCard';

interface MealSectionProps {
  title: string;
  emoji: string;
  entries: NutritionEntry[];
  onDelete: (id: string) => void;
  onEdit: (id: string, data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string }) => void;
  onAddManual: (mealType: string) => void;
  onAddCamera: (mealType: string) => void;
  onAddGallery: (mealType: string) => void;
  onAddSearch: (mealType: string) => void;
  mealType: string;
}

export default function MealSection({ title, emoji, entries, onDelete, onEdit, onAddManual, onAddCamera, onAddGallery, onAddSearch, mealType }: MealSectionProps) {
  const [expanded, setExpanded] = useState(entries.length > 0);
  const [showActions, setShowActions] = useState(false);

  const totalCal = entries.reduce((s, e) => s + (e.calories || 0), 0);

  const actions = [
    { icon: Camera, label: 'Take Photo', color: 'text-blue-400', onClick: () => { onAddCamera(mealType); setShowActions(false); } },
    { icon: Image, label: 'From Gallery', color: 'text-green-400', onClick: () => { onAddGallery(mealType); setShowActions(false); } },
    { icon: Search, label: 'Search Food', color: 'text-purple-400', onClick: () => { onAddSearch(mealType); setShowActions(false); } },
    { icon: Plus, label: 'Add Manually', color: 'text-[var(--accent)]', onClick: () => { onAddManual(mealType); setShowActions(false); } },
  ];

  return (
    <div className="card rounded-card overflow-hidden">
      {/* Section Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
          <div className="text-left">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              {entries.length} {entries.length === 1 ? 'item' : 'items'}
              {totalCal > 0 && ` · ${totalCal} cal`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
            className="tap-target rounded-lg text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors haptic"
          >
            <Plus className="w-4 h-4" />
          </button>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </div>
      </div>

      {/* Add Actions — 4 Options */}
      {showActions && (
        <div className="px-5 pb-3 grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => { e.stopPropagation(); action.onClick(); }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors haptic"
            >
              <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Meals List */}
      {expanded && (
        <div className="px-5 pb-4 space-y-2">
          {entries.length === 0 ? (
            <button
              onClick={() => setShowActions(true)}
              className="w-full py-6 border border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-muted)] text-xs hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              + Add {title.toLowerCase()} meal
            </button>
          ) : (
            entries.map((entry) => (
              <MealCard key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

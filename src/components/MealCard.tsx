import { Trash2, Pencil, Check, X } from 'lucide-react';
import { sanitizeText, clampNumber } from '../utils/validation';
import { useState } from 'react';
import type { NutritionEntry } from '../types';

interface MealCardProps {
  entry: NutritionEntry;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string }) => void;
}

export default function MealCard({ entry, onDelete, onEdit }: MealCardProps) {
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState(entry.name);
  const [editCalories, setEditCalories] = useState(String(entry.calories));
  const [editProtein, setEditProtein] = useState(String(entry.protein));
  const [editCarbs, setEditCarbs] = useState(String(entry.carbs));
  const [editFat, setEditFat] = useState(String(entry.fat));

  const handleSave = () => {
    onEdit(entry.id, {
      name: sanitizeText(editName) || entry.name,
      calories: clampNumber(editCalories, 1, 4999),
      protein: clampNumber(editProtein, 0, 500),
      carbs: clampNumber(editCarbs, 0, 1000),
      fat: clampNumber(editFat, 0, 500),
      serving: entry.serving,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(entry.name);
    setEditCalories(String(entry.calories));
    setEditProtein(String(entry.protein));
    setEditCarbs(String(entry.carbs));
    setEditFat(String(entry.fat));
    setEditing(false);
  };

  // Color-code by calorie density
  const calorieLevel = entry.calories < 200 ? 'meal-low' : entry.calories < 500 ? 'meal-med' : 'meal-high';

  return (
    <>
      <div className={`flex gap-4 sm:gap-5 card rounded-card p-4 sm:p-5 ${calorieLevel}`}>
        {entry.image ? (
          <img
            src={entry.image}
            alt={entry.name}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl flex-shrink-0 ring-1 ring-[var(--border-color)]"
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 flex items-center justify-center ring-1 ring-[var(--accent)]/10">
            <span className="text-xl sm:text-2xl">🍽️</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors"
                />
              ) : (
                <h3 className="text-[var(--text-primary)] font-bold text-sm sm:text-base truncate">{entry.name}</h3>
              )}
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {entry.serving}{entry.serving && entry.timestamp ? ' · ' : ''}{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              {editing ? (
                <>
                  <button onClick={handleSave} className="tap-target rounded-lg bg-[color-mix(in_srgb,var(--ring-calories)_10%,transparent)] text-[var(--ring-calories)] hover:bg-green-500/20 transition-colors haptic">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancel} className="tap-target rounded-lg bg-[var(--bg-hover)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors haptic">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="tap-target rounded-lg bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-secondary)] transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 haptic">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="tap-target rounded-lg bg-transparent text-[var(--text-muted)] hover:bg-red-500/20 hover:text-red-400 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 haptic">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          {entry.healthInsight && !editing && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1 mb-2.5 leading-relaxed">{entry.healthInsight}</p>
          )}
          {editing ? (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[
                { val: editCalories, set: setEditCalories, label: 'Cal' },
                { val: editProtein, set: setEditProtein, label: 'P' },
                { val: editCarbs, set: setEditCarbs, label: 'C' },
                { val: editFat, set: setEditFat, label: 'F' },
              ].map(({ val, set, label }) => (
                <input key={label} type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={label}
                  className="bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 tabular-nums transition-colors" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 sm:gap-4 text-[11px] text-[var(--text-muted)] tabular-nums">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[var(--ring-carbs)]" />
                <span className="text-[var(--text-primary)] font-bold">{Math.round(entry.calories)}</span> cal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[var(--ring-protein)]" />
                <span className="text-[var(--text-primary)] font-bold">{Math.round(entry.protein)}g</span> p
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[var(--ring-calories)]" />
                <span className="text-[var(--text-primary)] font-bold">{Math.round(entry.carbs)}g</span> c
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[var(--ring-fat)]" />
                <span className="text-[var(--text-primary)] font-bold">{Math.round(entry.fat)}g</span> f
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 mx-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-1">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Delete meal?</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1.5">Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">{entry.name}</span>?</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); onDelete(entry.id); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

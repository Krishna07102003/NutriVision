import { Trash2 } from 'lucide-react';

interface DietPlanProps {
  plan: string;
  onDelete?: () => void;
}

export default function DietPlan({ plan, onDelete }: DietPlanProps) {
  return (
    <div className="mb-12 border border-[var(--border-color)] rounded-xl p-5 sm:p-8 bg-[var(--bg-hover)]/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>
          Your 7-day plan
        </h2>
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
      <div className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line">
        {plan}
      </div>
    </div>
  );
}

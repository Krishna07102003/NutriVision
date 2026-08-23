import { useState } from 'react';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface DietPlanProps {
  plan: string;
  onDelete?: () => void;
}

function parseDays(plan: string) {
  const days: { title: string; content: string }[] = [];
  const regex = /(Day\s*\d+[^\n]*)/gi;
  const parts = plan.split(regex);

  if (parts.length <= 1) {
    // No "Day X" found — return the whole plan as one block
    return [{ title: 'Your Plan', content: plan.trim() }];
  }

  // parts[0] is text before first "Day" (usually empty)
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim();
    const content = (parts[i + 1] || '').trim();
    days.push({ title, content });
  }

  return days;
}

export default function DietPlan({ plan, onDelete }: DietPlanProps) {
  const days = parseDays(plan);
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() => {
    // First day expanded by default
    const init: Record<number, boolean> = {};
    days.forEach((_, i) => { init[i] = i === 0; });
    return init;
  });

  const toggle = (i: number) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    days.forEach((_, i) => { all[i] = true; });
    setExpanded(all);
  };

  const collapseAll = () => {
    const none: Record<number, boolean> = {};
    days.forEach((_, i) => { none[i] = false; });
    setExpanded(none);
  };

  const allExpanded = days.every((_, i) => expanded[i]);
  const allCollapsed = days.every((_, i) => !expanded[i]);

  return (
    <div className="mb-12 border border-[var(--border-color)] rounded-xl bg-[var(--bg-hover)]/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-[var(--border-color)]">
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>
          Your 7-day plan
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="text-[10px] tracking-wider uppercase font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-2 py-1"
          >
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
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
      </div>

      {/* Days */}
      <div className="divide-y divide-[var(--border-color)]">
        {days.map((day, i) => {
          const isOpen = expanded[i];
          return (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-3 px-5 sm:px-8 py-4 hover:bg-[var(--bg-card)] transition-colors text-left"
              >
                <div className="text-[var(--accent)]">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {day.title}
                </span>
              </button>

              {isOpen && day.content && (
                <div className="px-5 sm:px-8 pb-5 pl-12 sm:pl-16">
                  <div className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line">
                    {day.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

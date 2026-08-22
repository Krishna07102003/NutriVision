import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateNavigatorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  isToday: boolean;
}

export default function DateNavigator({ selectedDate, onChange, isToday }: DateNavigatorProps) {
  const formatted = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const goBack = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onChange(d);
  };

  const goForward = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    if (d <= new Date()) onChange(d);
  };

  const goToday = () => onChange(new Date());

  const canGoForward = selectedDate.toDateString() !== new Date().toDateString();

  return (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={goBack}
        className="p-2 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
      </button>
      <div className="flex-1 text-center">
        <p className="text-sm text-[var(--text-primary)] font-bold">{formatted}</p>
        {!isToday && (
          <button onClick={goToday} className="text-[11px] text-accent hover:underline mt-0.5">
            Go to today
          </button>
        )}
      </div>
      {canGoForward && (
        <button
          onClick={goForward}
          className="p-2 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      )}
      {!canGoForward && <div className="w-8" />}
      <button
        onClick={goToday}
        className={`p-2 rounded-lg border transition-colors ${
          isToday
            ? 'border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-accent/10'
            : 'border-[var(--border-color)] hover:border-[var(--accent)]'
        }`}
      >
        <Calendar className="w-4 h-4 text-accent" />
      </button>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateNavigatorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  isToday: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DateNavigator({ selectedDate, onChange, isToday }: DateNavigatorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const calendarRef = useRef<HTMLDivElement>(null);

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

  const canGoForward = selectedDate.toDateString() !== new Date().toDateString();

  // Close calendar when clicking outside
  useEffect(() => {
    if (!showCalendar) return;
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCalendar]);

  // Sync view to selected date when opening
  useEffect(() => {
    if (showCalendar) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [showCalendar, selectedDate]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    if (next <= today) {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    }
  };

  const canGoNextMonth =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  const selectDate = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    if (d <= today) {
      onChange(d);
      setShowCalendar(false);
    }
  };

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
          <button onClick={() => onChange(new Date())} className="text-[11px] text-accent hover:underline mt-0.5">
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

      {/* Calendar icon + popup */}
      <div className="relative" ref={calendarRef}>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={`p-2 rounded-lg border transition-colors ${
            showCalendar
              ? 'border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-accent/10'
              : isToday
                ? 'border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-accent/10'
                : 'border-[var(--border-color)] hover:border-[var(--accent)]'
          }`}
        >
          <Calendar className="w-4 h-4 text-accent" />
        </button>

        {showCalendar && (
          <div
            className="absolute right-0 top-full mt-2 z-50 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl p-3 w-[280px]"
            style={{ willChange: 'transform' }}
          >
            {/* Month/Year header */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {MONTHS[viewMonth]} {viewYear}
              </p>
              {canGoNextMonth ? (
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              ) : (
                <div className="w-7" />
              )}
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-[10px] font-medium text-[var(--text-secondary)] py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(viewYear, viewMonth, day);
                date.setHours(0, 0, 0, 0);
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isTodayDate = date.getTime() === today.getTime();
                const isFuture = date > today;

                return (
                  <button
                    key={day}
                    onClick={() => selectDate(day)}
                    disabled={isFuture}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all mx-auto
                      ${isFuture ? 'text-[var(--text-secondary)] opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/10'}
                      ${isSelected ? 'bg-accent text-white shadow-md' : ''}
                      ${isTodayDate && !isSelected ? 'ring-1 ring-accent text-accent font-bold' : ''}
                      ${!isSelected && !isFuture ? 'text-[var(--text-primary)]' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-3 pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => { onChange(new Date()); setShowCalendar(false); }}
                className="flex-1 py-1.5 text-xs font-medium text-accent rounded-lg hover:bg-accent/10 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setShowCalendar(false)}
                className="flex-1 py-1.5 text-xs font-medium text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface DateNavigatorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  isToday: boolean;
  children?: ReactNode;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DateNavigator({ selectedDate, onChange, isToday, children }: DateNavigatorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const calendarRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = getWeekStart(selectedDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const headerText = isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const prevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    onChange(d);
  };

  const nextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    if (d <= today) onChange(d);
  };

  const canGoNextWeek = weekDays[6] < today;

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

  useEffect(() => {
    if (showCalendar) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [showCalendar, selectedDate]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    if (next <= today) {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
      else setViewMonth(viewMonth + 1);
    }
  };

  const canGoNextMonth = viewYear < today.getFullYear() || (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  const selectDate = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    if (d <= today) { onChange(d); setShowCalendar(false); }
  };

  const toggleCalendar = () => setShowCalendar(!showCalendar);

  return (
    <div className="mb-4">
      {/* Header row: "Today ▼" clickable to open calendar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="relative" ref={calendarRef}>
          <button
            onClick={toggleCalendar}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{headerText}</h1>
            <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${showCalendar ? 'rotate-180' : ''}`} />
          </button>

          {/* Calendar dropdown */}
          {showCalendar && (
            <div className="absolute left-0 top-full mt-2 z-50 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl p-3 w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]">
                  <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {MONTHS[viewMonth]} {viewYear}
                </p>
                {canGoNextMonth ? (
                  <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]">
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                ) : <div className="w-7" />}
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-center text-[10px] font-medium text-[var(--text-secondary)] py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const d = new Date(viewYear, viewMonth, day);
                  d.setHours(0, 0, 0, 0);
                  const sel = d.toDateString() === selectedDate.toDateString();
                  const isT = d.getTime() === today.getTime();
                  const fut = d > today;
                  return (
                    <button key={day} onClick={() => selectDate(day)} disabled={fut}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all mx-auto
                        ${fut ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/10'}
                        ${sel ? 'bg-accent text-white shadow-md' : ''}
                        ${isT && !sel ? 'ring-1 ring-accent text-accent font-bold' : ''}
                        ${!sel && !fut ? 'text-[var(--text-primary)]' : ''}
                      `}
                    >{day}</button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-[var(--border-color)]">
                <button onClick={() => { onChange(new Date()); setShowCalendar(false); }}
                  className="flex-1 py-1.5 text-xs font-medium text-accent rounded-lg hover:bg-accent/10">Today</button>
                <button onClick={() => setShowCalendar(false)}
                  className="flex-1 py-1.5 text-xs font-medium text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-hover)]">Close</button>
              </div>
            </div>
          )}
        </div>
        {children && <div className="ml-2 shrink-0">{children}</div>}
      </div>

      {/* Weekly day strip */}
      <div className="flex items-center justify-between px-1">
        <button onClick={prevWeek} className="p-1 rounded-lg hover:bg-[var(--bg-hover)] transition-colors mr-1">
          <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        </button>

        <div className="flex items-center justify-around flex-1 gap-0.5">
          {weekDays.map((day, i) => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const isTodayDate = day.getTime() === today.getTime();
            const isFuture = day > today;
            const dayNum = day.getDate();

            return (
              <button
                key={i}
                onClick={() => !isFuture && onChange(day)}
                disabled={isFuture}
                className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all min-w-[36px]"
              >
                <span className={`text-[10px] font-semibold ${
                  isSelected ? 'text-accent' : 'text-[var(--text-secondary)]'
                }`}>
                  {DAY_LABELS[i]}
                </span>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${isFuture ? 'opacity-30' : ''}
                  ${isSelected ? 'bg-accent text-white shadow-lg shadow-accent/30' : ''}
                  ${isTodayDate && !isSelected ? 'ring-2 ring-accent text-accent' : ''}
                  ${!isSelected && !isTodayDate && !isFuture ? 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]' : ''}
                `}>
                  {dayNum}
                </div>
              </button>
            );
          })}
        </div>

        {canGoNextWeek ? (
          <button onClick={nextWeek} className="p-1 rounded-lg hover:bg-[var(--bg-hover)] transition-colors ml-1">
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          </button>
        ) : (
          <div className="w-5 ml-1" />
        )}
      </div>
    </div>
  );
}

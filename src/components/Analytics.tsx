import { useMemo, useState } from 'react';
import { BarChart3, Droplets, Footprints } from 'lucide-react';
import type { NutritionEntry, MacroGoals } from '../types';

type Macro = 'calories' | 'protein' | 'carbs' | 'fat';
type ChartTab = Macro | 'water' | 'steps';

interface AnalyticsProps {
  entries: NutritionEntry[];
  goals: MacroGoals;
  waterData?: { date: string; litres: number; label: string }[];
  stepsData?: { date: string; steps: number; label: string }[];
}

const MACRO_CONFIG: Record<Macro, { label: string; unit: string; color: string; goal: (goals: MacroGoals) => number }> = {
  calories: { label: 'Calories', unit: 'kcal', color: 'var(--ring-calories)', goal: (g) => g.calories },
  protein:  { label: 'Protein', unit: 'g', color: 'var(--ring-protein)', goal: (g) => g.protein },
  carbs:    { label: 'Carbs', unit: 'g', color: 'var(--ring-carbs)', goal: (g) => g.carbs },
  fat:      { label: 'Fat', unit: 'g', color: 'var(--ring-fat)', goal: (g) => g.fat },
};

const TAB_CONFIG: Record<ChartTab, { label: string; unit: string; color: string; goal: number; icon: React.ReactNode }> = {
  calories: { label: 'Calories', unit: 'kcal', color: 'var(--ring-calories)', goal: 2000, icon: null },
  protein:  { label: 'Protein', unit: 'g', color: 'var(--ring-protein)', goal: 150, icon: null },
  carbs:    { label: 'Carbs', unit: 'g', color: 'var(--ring-carbs)', goal: 250, icon: null },
  fat:      { label: 'Fat', unit: 'g', color: 'var(--ring-fat)', goal: 65, icon: null },
  water:    { label: 'Water', unit: 'L', color: 'var(--ring-water)', goal: 5, icon: <Droplets className="w-3 h-3" /> },
  steps:    { label: 'Steps', unit: '', color: '#a78bfa', goal: 8000, icon: <Footprints className="w-3 h-3" /> },
};

export default function Analytics({ entries, goals, waterData = [], stepsData = [] }: AnalyticsProps) {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const [tab, setTab] = useState<ChartTab>('calories');

  // Derive goal from macros or hardcoded for water/steps
  const goalValue = useMemo(() => {
    if (tab === 'water') return TAB_CONFIG.water.goal;
    if (tab === 'steps') return TAB_CONFIG.steps.goal;
    return (MACRO_CONFIG as Record<string, { goal: (g: MacroGoals) => number }>)[tab]?.goal(goals) ?? 0;
  }, [tab, goals]);

  const cfg = TAB_CONFIG[tab];

  // Build chart data based on tab
  const stats = useMemo(() => {
    const days = range === 'week' ? 7 : 30;
    const result: { date: string; value: number; label: string }[] = [];

    if (tab === 'water') {
      // Use waterData for last 7 days, or fill from entries
      const waterMap = new Map(waterData.map((w) => [w.date, w]));
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const wd = waterMap.get(dateStr);
        result.push({
          date: dateStr,
          value: wd?.litres ?? 0,
          label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        });
      }
    } else if (tab === 'steps') {
      // Use stepsData
      const stepsMap = new Map(stepsData.map((s) => [s.date, s]));
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const sd = stepsMap.get(dateStr);
        result.push({
          date: dateStr,
          value: sd?.steps ?? 0,
          label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        });
      }
    } else {
      // Macros from entries
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toDateString();
        const dayEntries = entries.filter((e) => new Date(e.timestamp).toDateString() === dateStr);
        const macroKey = tab as Macro;
        result.push({
          date: dateStr,
          value: dayEntries.reduce((s, e) => s + (e[macroKey] || 0), 0),
          label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        });
      }
    }
    return result;
  }, [entries, range, tab, waterData, stepsData]);

  // Summary stats
  const summary = useMemo(() => {
    const daysWith = stats.filter((s) => s.value > 0);
    if (daysWith.length === 0) return { avg: 0, total: 0, days: 0, hitGoal: 0 };
    const total = daysWith.reduce((sum, s) => sum + s.value, 0);
    const hitGoal = daysWith.filter((s) => s.value >= goalValue * 0.9).length;
    return {
      avg: Math.round(total / daysWith.length),
      total: Math.round(total),
      days: daysWith.length,
      hitGoal,
    };
  }, [stats, goalValue]);

  // Chart dimensions
  const chartWidth = 500;
  const chartHeight = 140;
  const pad = 25;
  const barGap = range === 'week' ? 8 : 2;
  const numBars = range === 'week' ? 7 : 30;
  const barWidth = (chartWidth - pad * 2) / numBars - barGap;

  const currentValues = stats.map((s) => s.value);
  const maxVal = Math.max(...currentValues, goalValue);

  // Unit display
  const unitLabel = tab === 'water' ? ' L' : tab === 'steps' ? '' : cfg.unit === 'g' ? 'g' : '';

  return (
    <div className="card rounded-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#38BDF8]/10 to-[#0EA5E9]/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-accent" />
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] font-bold">Progress</span>
        </div>
        <div className="flex gap-0.5 bg-[var(--bg-card)] rounded-xl p-0.5 border border-[var(--border-color)]">
          {(['week', 'month'] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs transition-all btn-premium ${
                range === r ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              {r === 'week' ? '7d' : '30d'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Selector — Macros + Water + Steps */}
      <div className="flex gap-1 mb-6 bg-[var(--bg-hover)] rounded-xl p-1 overflow-x-auto">
        {(Object.keys(TAB_CONFIG) as ChartTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              tab === t
                ? 'text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
            style={tab === t ? { backgroundColor: 'var(--bg-card)', color: TAB_CONFIG[t].color } : {}}
          >
            {TAB_CONFIG[t].icon}
            {TAB_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* Chart Label */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold" style={{ color: cfg.color }}>
          {cfg.label} — Last {range === 'week' ? '7' : '30'} Days
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">
          Goal: {goalValue.toLocaleString()} {cfg.unit || ''}
        </span>
      </div>

      {/* Bar Chart */}
      <div className="mb-6 -mx-1">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="w-full" preserveAspectRatio="none">
          {/* Goal line */}
          <line
            x1={pad} y1={pad + (1 - goalValue / maxVal) * (chartHeight - pad)}
            x2={chartWidth - pad} y2={pad + (1 - goalValue / maxVal) * (chartHeight - pad)}
            stroke={cfg.color} strokeWidth="1" strokeDasharray="4,4" opacity="0.4"
          />
          {/* Goal label */}
          <text
            x={chartWidth - pad + 2} y={pad + (1 - goalValue / maxVal) * (chartHeight - pad) + 3}
            fill={cfg.color} fontSize="7" fontWeight="600" opacity="0.6"
          >
            goal
          </text>
          {/* Bars */}
          {stats.map((s, i) => {
            const val = s.value;
            const x = pad + i * (barWidth + barGap);
            const barH = maxVal > 0 ? (val / maxVal) * (chartHeight - pad * 2) : 0;
            const hitGoal = val >= goalValue * 0.9;
            return (
              <g key={i}>
                <rect x={x} y={chartHeight + pad - barH} width={barWidth} height={barH} rx="3"
                  fill={hitGoal ? `url(#grad-${tab})` : cfg.color}
                  opacity={val > 0 ? (hitGoal ? 1 : 0.7) : 0.1}
                  className="transition-all duration-500"
                />
                {range === 'week' && (
                  <text x={x + barWidth / 2} y={chartHeight + pad + 14} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontWeight="600">
                    {s.label.split(' ')[0]}
                  </text>
                )}
              </g>
            );
          })}
          <defs>
            <linearGradient id={`grad-${tab}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cfg.color} />
              <stop offset="100%" stopColor={cfg.color} stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1.5 font-bold">Avg {cfg.label}</p>
          <p className="text-lg font-bold" style={{ color: cfg.color }}>
            {tab === 'water' ? `${(summary.avg / 1).toFixed(1)}` : summary.avg.toLocaleString()}{unitLabel}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">/ {goalValue.toLocaleString()} {cfg.unit || ''}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1.5 font-bold">
            {tab === 'water' ? 'Total' : tab === 'steps' ? 'Total' : 'Days Logged'}
          </p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {tab === 'water' || tab === 'steps'
              ? `${summary.total.toLocaleString()}${unitLabel}`
              : `${summary.days}/${range === 'week' ? 7 : 30}`}
          </p>
        </div>
        <div className="text-center p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1.5 font-bold">Hit Goal</p>
          <p className="text-lg font-bold" style={{ color: cfg.color }}>{summary.hitGoal}d</p>
          <p className="text-[10px] text-[var(--text-muted)]">out of {summary.days}d</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1.5 font-bold">
            {tab === 'steps' ? 'Avg Distance' : tab === 'water' ? 'Avg Remaining' : 'Consistency'}
          </p>
          <p className="text-lg font-bold text-[var(--text-primary)]">
            {tab === 'steps'
              ? `${(summary.avg * 0.00075).toFixed(1)}km`
              : tab === 'water'
              ? `${(goalValue - summary.avg).toFixed(1)}L`
              : `${summary.days > 0 ? Math.round((summary.hitGoal / summary.days) * 100) : 0}%`}
          </p>
        </div>
      </div>
    </div>
  );
}

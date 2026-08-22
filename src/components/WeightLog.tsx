import { useState, useMemo } from 'react';
import { Scale, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import type { WeightEntry } from '../types';

interface WeightLogProps {
  entries: WeightEntry[];
  latest: WeightEntry | null;
  onAdd: (kg: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function WeightLog({ entries, latest, onAdd, onDelete }: WeightLogProps) {
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(input);
    if (val > 20 && val < 300) {
      await onAdd(val);
      setInput('');
    }
  };

  const chartData = useMemo(() => [...entries].reverse().slice(-30), [entries]);

  const trend = useMemo(() => {
    if (entries.length < 2) return { direction: 'stable' as const, change: 0 };
    const recent = entries.slice(0, Math.min(7, entries.length));
    const change = recent[0].weight - recent[recent.length - 1].weight;
    return {
      direction: change > 0.3 ? 'up' as const : change < -0.3 ? 'down' as const : 'stable' as const,
      change: Math.abs(change).toFixed(1),
    };
  }, [entries]);

  const chartWidth = 400;
  const chartHeight = 100;
  const pad = 15;

  const svgPath = useMemo(() => {
    if (chartData.length < 2) return '';
    const weights = chartData.map((d) => d.weight);
    const minW = Math.min(...weights) - 0.5;
    const maxW = Math.max(...weights) + 0.5;
    const range = maxW - minW || 1;
    const points = chartData.map((d, i) => {
      const x = pad + (i / (chartData.length - 1)) * (chartWidth - pad * 2);
      const y = pad + (1 - (d.weight - minW) / range) * (chartHeight - pad * 2);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }, [chartData]);

  const currentWeight = latest?.weight || 0;

  return (
    <div className="card rounded-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0EA5E9]/10 to-[#38BDF8]/10 flex items-center justify-center">
            <Scale className="w-4 h-4 text-accent" />
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] font-semibold">Weight</span>
        </div>
        {latest && (
          <div className="flex items-center gap-2">
            {trend.direction === 'up' &&            <TrendingUp className="w-3.5 h-3.5 text-[var(--ring-fat)]" />}
            {trend.direction === 'down' &&            <TrendingDown className="w-3.5 h-3.5 text-[var(--ring-calories)]" />}
            {trend.direction === 'stable' && <Minus className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
            <span className="text-sm text-[var(--text-primary)] font-bold tabular-nums">
              {currentWeight} <span className="text-[var(--text-muted)] text-xs font-normal">kg</span>
            </span>
            {entries.length >= 2 && (
              <span className={`text-xs tabular-nums font-bold ${trend.direction === 'up' ? 'text-[var(--ring-fat)]' : trend.direction === 'down' ? 'text-[var(--ring-calories)]' : 'text-[var(--text-muted)]'}`}>
                {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.change}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="mb-4 -mx-1">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d={svgPath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {chartData.map((d, i) => {
              const weights = chartData.map((x) => x.weight);
              const minW = Math.min(...weights) - 0.5;
              const maxW = Math.max(...weights) + 0.5;
              const range = maxW - minW || 1;
              const x = pad + (i / (chartData.length - 1)) * (chartWidth - pad * 2);
              const y = pad + (1 - (d.weight - minW) / range) * (chartHeight - pad * 2);
              return i === chartData.length - 1 ? (
                <circle key={i} cx={x} cy={y} r="4" fill="var(--accent)" className="drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
              ) : null;
            })}
          </svg>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={latest ? `Last: ${currentWeight} kg` : 'Log weight (kg)'}
          step="0.1"
          min="20"
          max="300"
          className="flex-1 bg-[var(--input-bg)] border rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#38BDF8]/50 focus:ring-2 focus:ring-[#38BDF8]/10 tabular-nums transition-all"
        />
        <button
          type="submit"
          disabled={!input || parseFloat(input) <= 20}
          className="px-5 py-2.5 bg-accent hover:bg-accent-dim disabled:bg-[var(--border-color)] text-[var(--text-primary)] disabled:text-[var(--text-muted)] text-sm font-bold rounded-xl transition-all btn-press disabled:shadow-none"
        >
          Log
        </button>
      </form>

      {entries.length > 0 && (
        <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-[var(--text-muted)] hover:text-accent transition-colors font-bold">
          {expanded ? 'Hide history' : `View history (${entries.length})`}
        </button>
      )}

      {expanded && (
        <div className="mt-3 space-y-0.5 max-h-48 overflow-y-auto">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="text-sm text-[var(--text-primary)] font-bold tabular-nums">{entry.weight} kg</span>
              </div>
              <button onClick={() => onDelete(entry.id)} className="opacity-0 group-hover:opacity-100 sm:opacity-0 text-[var(--text-muted)] hover:text-[var(--ring-fat)] transition-all tap-target">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

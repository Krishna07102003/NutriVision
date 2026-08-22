import { useState, useEffect } from 'react';
import { Footprints } from 'lucide-react';

interface StepCounterProps {
  userWeight: number;
}

function stepsToCalories(steps: number, weightKg: number): number {
  const km = steps * 0.00075;
  return Math.round(weightKg * km * 0.5);
}

function stepsToKm(steps: number): number {
  return Math.round(steps * 0.00075 * 100) / 100;
}

function getTodayKey() {
  return `nutrivision-steps-${new Date().toISOString().split('T')[0]}`;
}

const STEP_PRESETS = [1000, 2000, 5000, 8000, 10000];

export default function StepCounter({ userWeight }: StepCounterProps) {
  const [steps, setSteps] = useState(0);
  const [inputVal, setInputVal] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(getTodayKey()) || '0');
      if (saved > 0) {
        setSteps(saved);
        setInputVal(String(saved));
      }
    } catch {}
  }, []);

  // Save to localStorage when steps change
  useEffect(() => {
    try {
      localStorage.setItem(getTodayKey(), String(steps));
    } catch {}
  }, [steps]);

  const handlePreset = (preset: number) => {
    setInputVal(String(preset));
  };

  const handleSave = () => {
    const v = parseInt(inputVal);
    if (!isNaN(v) && v > 0 && v <= 100000) {
      const newTotal = Math.min(100000, steps + v);
      setSteps(newTotal);
      setInputVal('');
    }
  };

  const caloriesBurned = stepsToCalories(steps, userWeight);
  const distance = stepsToKm(steps);

  return (
    <div className="card rounded-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] font-semibold">Steps Today</span>
        </div>
        {steps > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-purple-400 tabular-nums">{steps.toLocaleString()}</span>
            <button onClick={() => { setSteps(0); setInputVal(''); }} className="text-[10px] text-[var(--text-muted)] hover:text-red-400 transition-colors underline">Reset</button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="number"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
          onFocus={(e) => { setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); }}
          placeholder="Add more steps..."
          min="0"
          max="100000"
          className="flex-1 bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/50 tabular-nums"
        />
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2.5 rounded-lg bg-purple-500 text-white text-sm font-bold hover:bg-purple-600 active:bg-purple-700 transition-colors"
        >
          Save
        </button>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {STEP_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handlePreset(preset)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
              steps === preset
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-transparent hover:border-[var(--border-color)]'
            }`}
          >
            {(preset / 1000).toFixed(0)}k
          </button>
        ))}
      </div>

      {steps > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[var(--bg-hover)] rounded-lg px-3 py-2 text-center">
            <p className="text-sm font-bold text-purple-400 tabular-nums">{distance} km</p>
            <p className="text-[10px] text-[var(--text-muted)]">Distance</p>
          </div>
          <div className="bg-[var(--bg-hover)] rounded-lg px-3 py-2 text-center">
            <p className="text-sm font-bold text-purple-400 tabular-nums">~{caloriesBurned} cal</p>
            <p className="text-[10px] text-[var(--text-muted)]">Burned</p>
          </div>
        </div>
      )}
    </div>
  );
}

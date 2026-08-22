import { Minus } from 'lucide-react';

const PRESETS = [
  { label: '250 ml', amount: 0.25 },
  { label: '500 ml', amount: 0.5 },
  { label: '1 L', amount: 1 },
];

interface WaterTrackerProps {
  litres: number;
  goal: number;
  step: number;
  onAdd: (amount: number) => void;
  pct: number;
}

export default function WaterTracker({ litres, goal, onAdd, pct }: WaterTrackerProps) {
  return (
    <div className="card rounded-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Water Intake</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {litres.toFixed(1)}
          <span style={{ color: 'var(--text-muted)' }} className="ml-0.5">/{goal} L</span>
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Minus button */}
        <button
          onClick={() => onAdd(-0.25)}
          disabled={litres <= 0}
          className="tap-target rounded-xl border disabled:opacity-20 transition-all btn-press flex-shrink-0 haptic"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}
        >
          <Minus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Water bottle */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <svg viewBox="0 0 70 140" className="drop-shadow-lg w-12 h-24 sm:w-14 sm:h-28 md:w-[70px] md:h-[140px]">
              <defs>
                <linearGradient id="waterFill" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="var(--ring-water)" />
                  <stop offset="60%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.6" />
                </linearGradient>
                <clipPath id="bottleClip">
                  <path d="M22 30 L22 120 Q22 130 30 132 Q38 134 42 132 Q50 130 50 120 L50 30 Q50 25 45 22 L45 12 Q45 8 42 8 L28 8 Q25 8 25 12 L25 22 Q20 25 22 30 Z" />
                </clipPath>
                <linearGradient id="bottleGlass" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0" />
                  <stop offset="35%" stopColor="var(--text-primary)" stopOpacity="0.04" />
                  <stop offset="50%" stopColor="var(--text-primary)" stopOpacity="0.08" />
                  <stop offset="65%" stopColor="var(--text-primary)" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Bottle outline */}
              <path d="M22 30 L22 120 Q22 130 30 132 Q38 134 42 132 Q50 130 50 120 L50 30 Q50 25 45 22 L45 12 Q45 8 42 8 L28 8 Q25 8 25 12 L25 22 Q20 25 22 30 Z" fill="none" stroke="var(--border-color)" strokeWidth="2" />
              {/* Cap */}
              <rect x="27" y="2" width="16" height="7" rx="2" fill="var(--border-color)" />
              <rect x="29" y="0" width="12" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.5" />

              {/* Water fill */}
              <g clipPath="url(#bottleClip)">
                <rect x="20" y={134 - (pct / 100) * 124} width="34" height={(pct / 100) * 124 + 4} fill="url(#waterFill)" className="transition-all duration-700 ease-out" />
                {pct > 0 && (
                  <g className="transition-all duration-700 ease-out">
                    <path d={`M20 ${134 - (pct / 100) * 124} Q28 ${134 - (pct / 100) * 124 - 4} 35 ${134 - (pct / 100) * 124} Q42 ${134 - (pct / 100) * 124 + 4} 54 ${134 - (pct / 100) * 124}`} fill="var(--accent)" opacity="0.3" />
                    <path d={`M20 ${134 - (pct / 100) * 124 + 2} Q25 ${134 - (pct / 100) * 124 - 2} 33 ${134 - (pct / 100) * 124 + 2} Q41 ${134 - (pct / 100) * 124 + 6} 54 ${134 - (pct / 100) * 124 + 2}`} fill="var(--ring-water)" opacity="0.2" />
                  </g>
                )}
                {pct > 20 && (
                  <>
                    <circle cx="30" cy={120 - (pct / 100) * 80} r="2" fill="var(--text-primary)" opacity="0.2">
                      <animate attributeName="cy" values={`${120 - (pct / 100) * 80};${108 - (pct / 100) * 80};${120 - (pct / 100) * 80}`} dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="38" cy={125 - (pct / 100) * 90} r="1.5" fill="var(--text-primary)" opacity="0.15">
                      <animate attributeName="cy" values={`${125 - (pct / 100) * 90};${113 - (pct / 100) * 90};${125 - (pct / 100) * 90}`} dur="4s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
              </g>

              <path d="M22 30 L22 120 Q22 130 30 132 Q38 134 42 132 Q50 130 50 120 L50 30 Q50 25 45 22 L45 12 Q45 8 42 8 L28 8 Q25 8 25 12 L25 22 Q20 25 22 30 Z" fill="url(#bottleGlass)" />
              {[25, 50, 75].map((line) => (
                <line key={line} x1="48" y1={134 - (line / 100) * 124} x2="52" y2={134 - (line / 100) * 124} stroke="var(--border-color)" strokeWidth="1" opacity="0.5" />
              ))}
            </svg>
            <div className="text-center mt-2">
              <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--accent)' }}>{Math.round(pct)}%</span>
            </div>
          </div>
        </div>

        {/* Preset add buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {PRESETS.map(({ label, amount }) => (
            <button
              key={amount}
              onClick={() => onAdd(amount)}
              disabled={litres >= goal}
              className="px-3 py-2.5 rounded-lg text-[11px] font-bold transition-all btn-press disabled:opacity-20 haptic"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
                boxShadow: '0 0 12px color-mix(in srgb, var(--accent) 20%, transparent)',
              }}
            >
              +{label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

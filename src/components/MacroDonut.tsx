interface MacroDonutProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  ringVar: string;
}

export default function MacroDonut({ label, current, goal, unit, ringVar }: MacroDonutProps) {
  const pct = Math.min((current / goal) * 100, 100);
  const isOver = current > goal;

  const size = 100;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const gradientId = `grad-${label}`;
  const glowId = `glow-${label}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 w-16 h-16 sm:w-20 sm:h-20 md:w-[100px] md:h-[100px]">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`var(${ringVar})`} />
              <stop offset="100%" stopColor={`var(${ringVar})`} stopOpacity="0.7" />
            </linearGradient>
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track — 10% opacity of ring color */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={`var(${ringVar})`}
            strokeWidth={strokeWidth} opacity="0.1"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            filter={pct > 5 ? `url(#${glowId})` : undefined}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold tabular-nums" style={{ color: isOver ? 'var(--ring-fat)' : 'var(--text-primary)' }}>
            {Math.round(current)}
          </span>
          <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
            /{goal}{unit}
          </span>
        </div>
      </div>
      <span className="text-[10px] tracking-[0.15em] uppercase font-semibold mt-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

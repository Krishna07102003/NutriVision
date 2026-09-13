import { useId } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

const SIZES = {
  sm: { tile: 26, text: 'text-lg sm:text-xl', radius: 8, gap: 'gap-2' },
  md: { tile: 44, text: 'text-2xl', radius: 12, gap: 'gap-2.5' },
  lg: { tile: 60, text: 'text-3xl', radius: 15, gap: 'gap-3' },
} as const;

export default function Logo({ size = 'sm', showWordmark = true }: LogoProps) {
  const s = SIZES[size];
  const gid = useId();

  return (
    <span className={`inline-flex items-center ${s.gap} select-none`}>
      <svg
        width={s.tile}
        height={s.tile}
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="flex-shrink-0 drop-shadow-[0_2px_8px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-dim)" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx={s.radius} fill={`url(#${gid})`} />
        {/* Leaf — nutrition */}
        <path
          d="M23.5 8.5c.3 8.8-4.2 14-11.6 14-1 0-2-.1-2.9-.4C9.6 13.7 14.6 8.7 23.5 8.5z"
          fill="#ffffff"
          fillOpacity="0.96"
        />
        {/* Leaf vein */}
        <path
          d="M9.5 22.5c2.8-4.6 6.4-8.2 10.5-10.5"
          stroke="var(--accent-dim)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
        {/* IQ spark */}
        <circle cx="25" cy="7" r="2.2" fill="#ffffff" fillOpacity="0.9" />
      </svg>
      {showWordmark && (
        <span className={`${s.text} font-extrabold tracking-tight leading-none`}>
          <span className="text-[var(--text-primary)]">Poshan</span>
          <span
            style={{
              background: 'linear-gradient(120deg, var(--accent), var(--accent-dim))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            iq
          </span>
        </span>
      )}
    </span>
  );
}

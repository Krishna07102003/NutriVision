import { Flame, Trophy, Zap } from 'lucide-react';

interface StreakBadgeProps {
  entries: { timestamp: string }[];
}

function getStreak(entries: { timestamp: string }[]): number {
  if (entries.length === 0) return 0;

  // Get unique dates with entries
  const dates = new Set(
    entries.map((e) => new Date(e.timestamp).toISOString().split('T')[0])
  );

  // Count consecutive days backwards from today
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(today);

  // Check if today has entries — if not, start from yesterday
  if (!dates.has(checkDate.toISOString().split('T')[0])) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (dates.has(checkDate.toISOString().split('T')[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export default function StreakBadge({ entries }: StreakBadgeProps) {
  const streak = getStreak(entries);

  if (streak === 0) return null;

  const icon = streak >= 30 ? <Trophy className="w-4 h-4" /> : streak >= 7 ? <Flame className="w-4 h-4" /> : <Zap className="w-4 h-4" />;
  const color = streak >= 30 ? 'text-yellow-400' : streak >= 7 ? 'text-orange-400' : 'text-accent';
  const label = streak >= 30 ? 'Champion' : streak >= 7 ? 'On Fire' : 'Streak';

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] ${color}`}>
      {icon}
      <span className="text-xs font-bold tabular-nums">{streak}d</span>
      <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">{label}</span>
    </div>
  );
}

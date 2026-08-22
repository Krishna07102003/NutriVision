interface DailyInsightProps {
  aiCoach: string | null;
  loadingCoach: boolean;
  onGenerate: () => Promise<void>;
}

export default function DailyInsight({ aiCoach, loadingCoach, onGenerate }: DailyInsightProps) {
  return (
    <div className="mb-8 card rounded-card p-6">
      <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Today's insight
      </h2>
      {!aiCoach && !loadingCoach && (
        <button
          onClick={onGenerate}
          className="text-sm rounded-lg px-5 py-2.5 transition-colors btn-press"
          style={{ color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}
        >
          Generate insight
        </button>
      )}
      {loadingCoach && (
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--accent)' }} />
          Analyzing your day…
        </div>
      )}
      {aiCoach && (
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{aiCoach}</p>
      )}
    </div>
  );
}

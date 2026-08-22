interface DietPlanProps {
  plan: string;
}

export default function DietPlan({ plan }: DietPlanProps) {
  return (
    <div className="mb-12 border border-[var(--border-color)] rounded-xl p-5 sm:p-8 bg-[var(--bg-hover)]/50">
      <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Georgia', serif" }}>
        Your 3-day plan
      </h2>
      <div className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line">
        {plan}
      </div>
    </div>
  );
}

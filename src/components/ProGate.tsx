import { Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProGateProps {
  feature: string;
  description?: string;
  trialDaysLeft?: number;
  isTrialActive?: boolean;
}

export default function ProGate({ feature, description, trialDaysLeft, isTrialActive }: ProGateProps) {
  const navigate = useNavigate();

  return (
    <div className="border border-dashed border-amber-500/30 rounded-2xl p-6 text-center bg-amber-500/5">
      <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-3">
        <Crown className="w-6 h-6 text-amber-400" />
      </div>
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{feature}</h3>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        {description || 'Upgrade to Pro to unlock this feature'}
      </p>
      {isTrialActive && trialDaysLeft !== undefined && (
        <p className="text-xs text-accent mb-3 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          Free trial: {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left
        </p>
      )}
      <button
        onClick={() => navigate('/pricing')}
        className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-dim transition-colors"
      >
        Upgrade to Pro
      </button>
    </div>
  );
}

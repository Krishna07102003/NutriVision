import { useState } from 'react';
import { Check, Crown, Zap, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SubscriptionState } from '../hooks/useSubscription';

interface PricingPageProps {
  subscription: SubscriptionState;
}

const PRO_FEATURES = [
  'AI Diet Plan Generation (7-day custom plans)',
  'Unlimited AI Coach conversations',
  'Advanced Progress Analytics & Charts',
  'Barcode Scanner for food logging',
  'Export meals & weight data as CSV',
  'Priority support',
];

export default function PricingPage({ subscription }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    setPaying(true);
    try {
      await subscription.subscribe(selectedPlan);
    } finally {
      setPaying(false);
    }
  };

  const savings = Math.round(((99 * 12 - 799) / (99 * 12)) * 100);

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 animate-page-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Upgrade to Pro</h1>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Unlock the full power of NutriVision with AI-powered insights, unlimited coaching, and advanced analytics.
        </p>
      </div>

      {subscription.isTrialActive && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
          <p className="text-sm text-accent font-bold">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Free Trial Active — {subscription.trialDaysLeft} day{subscription.trialDaysLeft !== 1 ? 's' : ''} left
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">All Pro features are available during your trial</p>
        </div>
      )}

      {subscription.isPro && !subscription.isTrialActive && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-emerald-400 font-bold">
            <Check className="w-4 h-4 inline mr-1" />
            You're already a Pro member!
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {subscription.subscription?.plan === 'monthly' ? 'Monthly' : 'Yearly'} plan — Renews{' '}
            {subscription.subscription?.end_date ? new Date(subscription.subscription.end_date).toLocaleDateString() : ''}
          </p>
        </div>
      )}

      {!subscription.isPro && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`relative border-2 rounded-2xl p-6 text-left transition-all ${
              selectedPlan === 'monthly'
                ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                : 'border-[var(--border-color)] hover:border-accent/30'
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">Monthly</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">₹99<span className="text-sm font-normal text-[var(--text-muted)]">/month</span></p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Billed monthly</p>
            {selectedPlan === 'monthly' && (
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>

          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`relative border-2 rounded-2xl p-6 text-left transition-all ${
              selectedPlan === 'yearly'
                ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                : 'border-[var(--border-color)] hover:border-accent/30'
            }`}
          >
            <div className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Save {savings}%
            </div>
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">Yearly</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">₹799<span className="text-sm font-normal text-[var(--text-muted)]">/year</span></p>
            <p className="text-xs text-[var(--text-muted)] mt-1">That's just ₹67/month</p>
            {selectedPlan === 'yearly' && (
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>
      )}

      <div className="border border-[var(--border-color)] rounded-2xl p-6 bg-[var(--bg-card)]/50">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> What you get with Pro
        </h3>
        <ul className="space-y-3">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {!subscription.isPro && (
        <button
          onClick={handleSubscribe}
          disabled={paying}
          className="w-full py-4 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-dim transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {paying ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Crown className="w-4 h-4" />
              Subscribe — ₹{selectedPlan === 'monthly' ? '99/month' : '799/year'}
            </>
          )}
        </button>
      )}

      <p className="text-[10px] text-[var(--text-muted)] text-center">
        Payments are processed securely via Razorpay. Cancel anytime from your profile.
      </p>
    </div>
  );
}

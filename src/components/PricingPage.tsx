import { useState } from 'react';
import { Check, Crown, Zap, Sparkles, ArrowLeft, Calendar, CreditCard } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import type { SubscriptionState } from '../hooks/useSubscription';
import type { PlanName } from '../utils/razorpay';

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
  const [selectedPlan, setSelectedPlan] = useState<PlanName>('yearly');
  const [autoPay, setAutoPay] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    const result = await subscription.subscribe(selectedPlan, autoPay);
    if (result.success) setShowSuccess(true);
  };

  const handleCancel = async () => {
    setCancelling(true);
    const result = await subscription.cancel();
    setCancelling(false);
    if (result.success) {
      setConfirmCancel(false);
      setShowSuccess(false);
    }
  };

  const savings = Math.round(((99 * 12 - 799) / (99 * 12)) * 100);
  const sub = subscription.subscription;
  // Window is 24h from purchase. Fall back to created_at if start_date is missing/invalid.
  const purchaseMs = (() => {
    const start = sub?.start_date ? new Date(sub.start_date).getTime() : NaN;
    if (!Number.isNaN(start)) return start;
    const created = sub?.created_at ? new Date(sub.created_at).getTime() : NaN;
    return Number.isNaN(created) ? Date.now() : created;
  })();
  const hoursSincePurchase = Math.max(0, (Date.now() - purchaseMs) / (60 * 60 * 1000));
  const cancelWindowOpen =
    !!sub && !subscription.isTrialActive && hoursSincePurchase <= 24;

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
          Unlock the full power of Poshaniq with AI-powered insights, unlimited coaching, and advanced analytics.
        </p>
      </div>

      {/* Error message */}
      {subscription.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-red-400">{subscription.error}</p>
        </div>
      )}

      {subscription.isTrialActive && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
          <p className="text-sm text-accent font-bold">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Free Trial Active — {subscription.trialDaysLeft} day{subscription.trialDaysLeft !== 1 ? 's' : ''} left
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">All Pro features are available during your trial. Subscribe now to keep Pro after it ends.</p>
        </div>
      )}

      {subscription.isPro && !subscription.isTrialActive && sub && (
        <div className="border border-emerald-500/20 rounded-2xl p-6 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-emerald-400">You're a Pro member</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">Plan</p>
              <p className="text-sm font-bold text-[var(--text-primary)] capitalize">
                {sub.plan === 'monthly' ? 'Monthly' : 'Yearly'} · ₹{sub.plan === 'monthly' ? 99 : 799}
              </p>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">Renews on</p>
              <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                {new Date(sub.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">Last payment</p>
              <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                ₹{(sub.amount / 100).toFixed(0)} · {new Date(sub.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {!cancelWindowOpen && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">
                Cancellation and refunds are available within the first <b>24 hours</b> of purchase only. Purchased on{' '}
                {new Date(purchaseMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — this
                purchase is more than 24 hours old, so it can no longer be cancelled from the app. Contact support for help.
              </p>
            </div>
          )}
          {cancelWindowOpen && !confirmCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              disabled={subscription.loading}
              className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              Cancel subscription (full refund within {Math.max(0, Math.ceil(24 - hoursSincePurchase))}h)
            </button>
          )}
          {cancelWindowOpen && confirmCancel && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-[var(--text-primary)] font-semibold mb-3">
                Cancel now and get a full refund of ₹{((sub?.amount || 0) / 100).toFixed(0)}? Pro will be removed immediately. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-muted)] transition-colors disabled:opacity-50"
                >
                  Keep Pro
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, cancel'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(!subscription.isPro || subscription.isTrialActive) && (
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
            <p className="text-xs text-[var(--text-muted)] mt-1">Billed monthly. Cancel anytime.</p>
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

      {(!subscription.isPro || subscription.isTrialActive) && (
        <div className="space-y-3">
          <label className="flex items-start gap-3 border border-[var(--border-color)] rounded-xl p-4 bg-[var(--bg-card)]/50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPay}
              onChange={(e) => setAutoPay(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#38BDF8] cursor-pointer flex-shrink-0"
            />
            <span>
              <span className="block text-sm font-bold text-[var(--text-primary)]">
                Enable auto-payment (recommended)
              </span>
              <span className="block text-xs text-[var(--text-muted)] mt-0.5">
                Your subscription renews automatically every {selectedPlan === 'monthly' ? 'month' : 'year'} so Pro never lapses. You can cancel within the first 24 hours of each charge for a full refund.
              </span>
            </span>
          </label>
          <button
            onClick={handleSubscribe}
            disabled={subscription.loading}
            className="w-full py-4 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-dim transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {subscription.loading ? (
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
        </div>
      )}

      <p className="text-[10px] text-[var(--text-muted)] text-center flex items-center justify-center gap-1">
        <CreditCard className="w-3 h-3" />
        Payments are processed securely via Razorpay. Cancel anytime from this page.
      </p>

      <p className="text-[10px] text-[var(--text-muted)] text-center max-w-sm mx-auto leading-relaxed">
        By subscribing you agree to our{' '}
        <Link to="/terms" className="underline hover:text-[var(--text-primary)]">Terms</Link>,{' '}
        <Link to="/privacy-policy" className="underline hover:text-[var(--text-primary)]">Privacy Policy</Link> and{' '}
        <Link to="/refund-policy" className="underline hover:text-[var(--text-primary)]">Refund &amp; Cancellation Policy</Link>
        (full refund within 24 hours of any charge). Questions? <Link to="/contact" className="underline hover:text-[var(--text-primary)]">Contact us</Link>.
      </p>

      {/* Payment success modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowSuccess(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Payment Successful 🎉</h3>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              You're now a Pro member! All premium features are unlocked.
            </p>
            {sub && (
              <p className="text-xs text-[var(--text-muted)] mb-5">
                <Calendar className="w-3 h-3 inline mr-1" />
                {sub.razorpay_subscription_id
                  ? `Auto-payment enabled — renews on ${new Date(sub.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : `Pro active until ${new Date(sub.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </p>
            )}
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
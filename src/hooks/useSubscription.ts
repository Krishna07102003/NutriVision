import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { loadRazorpayScript, createSubscriptionOrder, type PlanName } from '../utils/razorpay';

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanName;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  razorpay_subscription_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface SubscriptionState {
  subscription: Subscription | null;
  isPro: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
  loading: boolean;
  error: string;
  subscribe: (plan: PlanName) => Promise<{ success: boolean; cancelled?: boolean }>;
  cancel: () => Promise<{ success: boolean }>;
  refresh: () => Promise<void>;
}

export function useSubscription(userId: string | null): SubscriptionState {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const checkSubscription = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    // Check active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (sub && new Date(sub.end_date) > new Date()) {
      setSubscription(sub);
      setIsPro(true);
      setIsTrialActive(false);
      setTrialDaysLeft(0);
      setLoading(false);
      return;
    }

    // Check trial status from user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('trial_ends_at')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.trial_ends_at) {
      const trialEnd = new Date(profile.trial_ends_at);
      const now = new Date();
      if (trialEnd > now) {
        const days = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setIsTrialActive(true);
        setTrialDaysLeft(days);
        setIsPro(true);
        setLoading(false);
        return;
      }
    }

    setSubscription(null);
    setIsPro(false);
    setIsTrialActive(false);
    setTrialDaysLeft(0);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = async (plan: PlanName) => {
    if (!userId) return { success: false };
    setError('');
    setLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment gateway. Check your internet connection.');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const userEmail = user.email || '';

      const result = await createSubscriptionOrder(plan, userEmail, userName);
      await checkSubscription();
      return result;
    } catch (err: any) {
      const message = err?.message || 'Payment failed. Please try again.';
      if (message !== 'Payment cancelled') {
        setError(message);
        console.error('Subscribe error:', err);
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    setError('');
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-payment', {
        body: { action: 'cancel' },
      });
      if (fnError) throw new Error(fnError.message || 'Could not cancel subscription');
      if (!data?.success) throw new Error('Could not cancel subscription');
      await checkSubscription();
      return { success: true };
    } catch (err: any) {
      const message = err?.message || 'Could not cancel subscription.';
      setError(message);
      console.error('Cancel error:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    isPro,
    isTrialActive,
    trialDaysLeft,
    loading,
    error,
    subscribe,
    cancel,
    refresh: checkSubscription,
  };
}
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { loadRazorpayScript, createSubscriptionOrder } from '../utils/razorpay';

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  razorpay_subscription_id: string | null;
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
  subscribe: (plan: 'monthly' | 'yearly') => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSubscription(userId: string | null): SubscriptionState {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [loading, setLoading] = useState(true);

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
        setIsPro(true); // Trial users get pro features
        setLoading(false);
        return;
      }
    }

    // No subscription, no active trial
    setSubscription(null);
    setIsPro(false);
    setIsTrialActive(false);
    setTrialDaysLeft(0);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = async (plan: 'monthly' | 'yearly') => {
    if (!userId) return;

    setLoading(true);
    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment gateway');

      // Get user info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const userEmail = user.email || '';

      await createSubscriptionOrder(plan, userId, userEmail, userName);
      // After payment handler runs, refresh subscription
      setTimeout(() => checkSubscription(), 2000);
    } catch (err) {
      console.error('Subscribe error:', err);
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
    subscribe,
    refresh: checkSubscription,
  };
}

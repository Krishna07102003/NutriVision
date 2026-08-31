import { supabase } from '../supabaseClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Load Razorpay script dynamically
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Create a subscription order on Supabase Edge Function (or direct for MVP)
export async function createSubscriptionOrder(
  plan: 'monthly' | 'yearly',
  userId: string,
  userEmail: string,
  userName: string,
) {
  const amount = plan === 'monthly' ? 9900 : 79900; // In paise (₹99 / ₹799)
  
  // For MVP: create order client-side via Razorpay
  // In production, use a Supabase Edge Function for server-side order creation
  const options = {
    key: RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    name: 'NutriVision',
    description: plan === 'monthly' ? 'Monthly Pro Plan' : 'Yearly Pro Plan',
    image: '/icon-192.png',
    handler: async function (response: any) {
      // Payment successful
      const endDate = new Date();
      if (plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
      else endDate.setFullYear(endDate.getFullYear() + 1);

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: 'active',
        razorpay_subscription_id: response.razorpay_subscription_id || null,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        amount,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
      }, { onConflict: 'user_id' });

      if (error) {
        console.error('Subscription save error:', error);
        return { success: false, error: error.message };
      }

      // Update user_profiles is_pro flag
      await supabase.from('user_profiles').update({ is_pro: true }).eq('id', userId);

      return { success: true };
    },
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: '#38BDF8',
    },
    modal: {
      ondismiss: function () {
        console.log('Payment modal dismissed');
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
  return { success: true };
}

export function getPlanPrice(plan: 'monthly' | 'yearly') {
  return plan === 'monthly' ? 99 : 799;
}

export function getPlanPricePaise(plan: 'monthly' | 'yearly') {
  return plan === 'monthly' ? 9900 : 79900;
}

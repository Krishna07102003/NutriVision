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

// Create order via Supabase Edge Function (server-side)
async function createRazorpayOrder(amount: number): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('create-order', {
    body: { amount, currency: 'INR' },
  });

  if (error) throw new Error(error.message || 'Failed to create order');
  if (!data?.order_id) throw new Error('No order ID returned');
  return data.order_id;
}

// Open Razorpay checkout with server-created order
export async function createSubscriptionOrder(
  plan: 'monthly' | 'yearly',
  userId: string,
  userEmail: string,
  userName: string,
) {
  const amount = plan === 'monthly' ? 9900 : 79900; // In paise

  // Create order server-side first
  const orderId = await createRazorpayOrder(amount);

  return new Promise((resolve, reject) => {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount,
      currency: 'INR',
      name: 'NutriVision',
      description: plan === 'monthly' ? 'Monthly Pro Plan — ₹99/month' : 'Yearly Pro Plan — ₹799/year',
      image: '/icon-192.png',
      order_id: orderId,
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
          reject(error);
          return;
        }

        // Update user_profiles is_pro flag
        await supabase.from('user_profiles').update({ is_pro: true }).eq('id', userId);
        resolve({ success: true });
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
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
      reject(response.error);
    });
    razorpay.open();
  });
}

export function getPlanPrice(plan: 'monthly' | 'yearly') {
  return plan === 'monthly' ? 99 : 799;
}

import { supabase } from '../supabaseClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PLAN_PRICES = {
  monthly: 99,
  yearly: 799,
} as const;

export type PlanName = keyof typeof PLAN_PRICES;

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

interface Session {
  order_id?: string;
  subscription_id?: string;
  amount: number;
  key_id: string;
}

// Create the checkout session server-side.
// autoPay = true  → Razorpay subscription (mandate, renews automatically)
// autoPay = false → one-time order (single charge, no renewal)
async function createCheckoutSession(plan: PlanName, autoPay: boolean): Promise<Session> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const fnName = autoPay ? 'create-subscription' : 'create-order';
  const { data, error } = await supabase.functions.invoke(fnName, { body: { plan } });
  if (error) {
    // supabase-js hides the server's real message — dig it out of context
    const realMessage = (error as any)?.context?.error
      || (error as any)?.context?.message
      || error.message
      || `Failed to start payment (${fnName})`;
    console.error(`[${fnName}] server error:`, realMessage, error);
    throw new Error(typeof realMessage === 'string' ? realMessage : 'Payment could not be started. Please try again.');
  }
  if (!data?.key_id) throw new Error('No Razorpay key returned');

  return data as Session;
}

// Open Razorpay checkout and verify the payment server-side before trusting it
export async function createSubscriptionOrder(
  plan: PlanName,
  userEmail: string,
  userName: string,
  autoPay = true,
): Promise<{ success: boolean; endDate?: string }> {
  // Create the session server-side first; the server returns the public Razorpay key
  const session = await createCheckoutSession(plan, autoPay);
  const razorpayKey = session.key_id || RAZORPAY_KEY_ID;
  if (!razorpayKey) {
    throw new Error('Razorpay is not configured on this deployment yet. Please try again in a few minutes.');
  }

  return new Promise((resolve, reject) => {
    const options: any = {
      key: razorpayKey,
      name: 'NutriVision',
      description: plan === 'monthly' ? 'Monthly Pro Plan — ₹99/month' : 'Yearly Pro Plan — ₹799/year',
      image: '/icon-192.png',
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#38BDF8',
      },
      handler: async function (response: any) {
        try {
          const body: any = {
            plan,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          if (response.razorpay_subscription_id) {
            body.razorpay_subscription_id = response.razorpay_subscription_id;
          } else if (response.razorpay_order_id) {
            body.razorpay_order_id = response.razorpay_order_id;
          } else {
            throw new Error('Payment response missing order/subscription id');
          }

          const { data, error } = await supabase.functions.invoke('verify-payment', { body });
          if (error) {
            console.error('Verify payment error:', error);
            reject(new Error('Payment was successful but we could not confirm it yet. Your payment is safe — contact support with your payment ID.'));
            return;
          }
          resolve({ success: true, endDate: data?.end_date });
        } catch (err: any) {
          reject(err);
        }
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled'));
        },
      },
    };

    // auto-pay (subscription) vs one-time (order)
    if (session.subscription_id) {
      options.subscription_id = session.subscription_id;
    } else {
      options.order_id = session.order_id;
      options.amount = session.amount;
      options.currency = 'INR';
    }

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
      reject(response.error);
    });
    razorpay.open();
  });
}

export function getPlanPrice(plan: PlanName) {
  return PLAN_PRICES[plan];
}

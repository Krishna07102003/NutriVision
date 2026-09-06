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

// Create order via Supabase Edge Function (server-side, price decided on the server)
async function createRazorpayOrder(plan: PlanName): Promise<{ order_id: string; amount: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('create-order', {
    body: { plan },
  });

  if (error) throw new Error(error.message || 'Failed to create order');
  if (!data?.order_id) throw new Error('No order ID returned');
  return data as { order_id: string; amount: number };
}

// Open Razorpay checkout with server-created order
export async function createSubscriptionOrder(
  plan: PlanName,
  userEmail: string,
  userName: string,
): Promise<{ success: boolean; endDate?: string }> {
  // Create order server-side first
  const { order_id: orderId, amount } = await createRazorpayOrder(plan);

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
        // Payment successful — verify server-side before trusting it
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            plan,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          },
        });

        if (error) {
          console.error('Verify payment error:', error);
          reject(new Error('Payment was successful but we could not confirm it yet. Your payment is safe — contact support with your payment ID.'));
          return;
        }
        resolve({ success: true, endDate: data?.end_date });
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

export function getPlanPrice(plan: PlanName) {
  return PLAN_PRICES[plan];
}
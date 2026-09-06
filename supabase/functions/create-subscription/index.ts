import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLANS = {
  monthly: { amount: 9900, period: "monthly", label: "NutriVision Pro Monthly" },
  yearly: { amount: 79900, period: "yearly", label: "NutriVision Pro Yearly" },
} as const;
type PlanName = keyof typeof PLANS;

// Razorpay requires total_count >= 1 and rejects 0 ("infinite"). A high count
// means the subscription auto-renews until the user cancels — 100 monthly
// cycles ≈ 8+ years, 100 yearly cycles ≈ a century. Effectively lifetime.
const TOTAL_CYCLES = 100;

async function apiFetch(path: string, keyId: string, keySecret: string, init?: RequestInit) {
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch(`https://api.razorpay.com${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.description || `Razorpay request failed (${res.status})`);
  }
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow authenticated users
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { plan } = await req.json();
    const cfg = PLANS[plan];
    if (!cfg) throw new Error("Invalid plan");

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeyId || !razorpayKeySecret) throw new Error("Razorpay keys not configured");

    // 1. Find an existing Razorpay customer for this user (reuse if we have a past subscription)
    let customerId: string | null = null;
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("razorpay_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.razorpay_subscription_id) {
      try {
        const sub = await apiFetch(`/v1/subscriptions/${existing.razorpay_subscription_id}`, razorpayKeyId, razorpayKeySecret);
        if (sub.customer_id) customerId = sub.customer_id;
      } catch {
        // subscription no longer exists — create a new customer below
      }
    }

    if (!customerId) {
      const customer = await apiFetch("/v1/customers", razorpayKeyId, razorpayKeySecret, {
        method: "POST",
        body: JSON.stringify({
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          email: user.email || undefined,
          notes: { user_id: user.id },
        }),
      });
      customerId = customer.id;
    }

    // 2. Find an existing plan for this period/amount, otherwise create one
    const list = await apiFetch("/v1/plans?count=100", razorpayKeyId, razorpayKeySecret);
    const plans: any[] = list.items || [];
    let planId = plans.find(
      (p) => p.period === cfg.period && p.item?.amount === cfg.amount && p.item?.currency === "INR"
    )?.id;

    if (!planId) {
      const created = await apiFetch("/v1/plans", razorpayKeyId, razorpayKeySecret, {
        method: "POST",
        body: JSON.stringify({
          period: cfg.period,
          interval: 1,
          item: { name: cfg.label, amount: cfg.amount, currency: "INR" },
          notes: { plan },
        }),
      });
      planId = created.id;
    }

    // 3. Create an auto-renewing subscription (renews every cycle until cancelled)
    const subscription = await apiFetch("/v1/subscriptions", razorpayKeyId, razorpayKeySecret, {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        total_count: TOTAL_CYCLES,
        customer_id: customerId,
        notes: { user_id: user.id, plan },
        quantity: 1,
      }),
    });

    return new Response(
      JSON.stringify({ subscription_id: subscription.id, key_id: razorpayKeyId, amount: cfg.amount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

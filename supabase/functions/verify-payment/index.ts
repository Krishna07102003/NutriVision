import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 9900, // ₹99 in paise
  yearly: 79900, // ₹799 in paise
};

const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

async function hmacSha256(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();

    // ================= CANCEL (within 24h refund window) =================
    if (body.action === "cancel") {
      const { data: row } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (!row) throw new Error("No active subscription found");

      const startMs = new Date(row.start_date).getTime();
      const windowLeft = startMs + CANCEL_WINDOW_MS - Date.now();
      if (windowLeft <= 0) {
        throw new Error(
          `Cancellation is available only within the first 24 hours of your purchase. Your Pro continues until ${new Date(row.end_date).toLocaleDateString("en-IN")}. Please contact support for any other request.`
        );
      }

      const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
      const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
      if (!razorpayKeyId || !razorpayKeySecret) throw new Error("Razorpay keys not configured");

      // 1. Refund the charge (full amount)
      if (row.razorpay_payment_id) {
        try {
          await apiFetch(`/v1/payments/${row.razorpay_payment_id}/refund`, razorpayKeyId, razorpayKeySecret, {
            method: "POST",
            body: JSON.stringify({ amount: row.amount }),
          });
        } catch (err) {
          throw new Error(`Refund failed: ${err.message}. Your subscription was not cancelled — contact support.`);
        }
      }

      // 2. Stop future auto-renewals
      if (row.razorpay_subscription_id) {
        try {
          await apiFetch(`/v1/subscriptions/${row.razorpay_subscription_id}/cancel`, razorpayKeyId, razorpayKeySecret, {
            method: "POST",
            body: JSON.stringify({ cancel_at_cycle_end: false }),
          });
        } catch {
          // already inactive — fine
        }
      }

      // 3. Revoke Pro locally
      await supabase.from("subscriptions").update({ status: "cancelled" }).eq("user_id", user.id);
      await supabase.from("user_profiles").update({ is_pro: false }).eq("id", user.id);

      return new Response(
        JSON.stringify({ success: true, cancelled: true, refunded: true, amount_refunded: row.amount / 100 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ================= VERIFY PAYMENT =================
    const { plan, razorpay_order_id, razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = body;
    const amount = PLAN_AMOUNTS[plan];
    if (!amount) throw new Error("Invalid plan");
    if (!razorpay_payment_id || !razorpay_signature) throw new Error("Missing payment details");

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeyId || !razorpayKeySecret) throw new Error("Razorpay keys not configured");

    let endDateIso: string;
    let activeSubscriptionId: string | null = null;

    if (razorpay_subscription_id) {
      // ---- Subscription (auto-pay) payment ----
      // Signature for subscriptions: HMAC(payment_id | subscription_id)
      const expected = await hmacSha256(razorpayKeySecret, `${razorpay_payment_id}|${razorpay_subscription_id}`);
      if (expected !== razorpay_signature) throw new Error("Invalid payment signature");

      // The payment itself is the source of truth: must be captured and match the plan amount
      const payment = await apiFetch(`/v1/payments/${razorpay_payment_id}`, razorpayKeyId, razorpayKeySecret);
      if (payment.status !== "captured") throw new Error(`Payment not captured (status: ${payment.status})`);
      if (payment.amount !== amount) throw new Error("Payment amount mismatch");

      // The subscription must belong to this user. Its status may briefly be
      // pending/authenticated while the mandate activates — that's fine, the
      // captured payment is what matters. Only reject hard failures.
      const subEntity = await apiFetch(`/v1/subscriptions/${razorpay_subscription_id}`, razorpayKeyId, razorpayKeySecret);
      if (subEntity.notes?.user_id !== user.id) throw new Error("Subscription does not belong to this account");
      if (subEntity.notes?.plan !== plan) throw new Error("Subscription plan mismatch");
      if (subEntity.status === "cancelled" || subEntity.status === "expired" || subEntity.status === "halted") {
        throw new Error(`Subscription is ${subEntity.status}`);
      }
      if (payment.subscription_id && payment.subscription_id !== razorpay_subscription_id) {
        throw new Error("Payment does not match subscription");
      }

      // End of the current billing cycle = Pro expiry
      const currentEnd = subEntity.current_end;
      endDateIso = currentEnd
        ? new Date(currentEnd * 1000).toISOString()
        : new Date(Date.now() + (plan === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString();
      activeSubscriptionId = razorpay_subscription_id;
    } else {
      // ---- One-time order payment (legacy flow) ----
      if (!razorpay_order_id) throw new Error("Missing order id");
      const expected = await hmacSha256(razorpayKeySecret, `${razorpay_order_id}|${razorpay_payment_id}`);
      if (expected !== razorpay_signature) throw new Error("Invalid payment signature");

      const order = await apiFetch(`/v1/orders/${razorpay_order_id}`, razorpayKeyId, razorpayKeySecret);
      if (order.amount !== amount) throw new Error("Payment amount mismatch");
      if (order.notes?.user_id !== user.id) throw new Error("Order does not belong to this account");

      const payment = await apiFetch(`/v1/payments/${razorpay_payment_id}`, razorpayKeyId, razorpayKeySecret);
      if (payment.order_id !== razorpay_order_id) throw new Error("Payment does not match order");
      if (payment.amount !== order.amount) throw new Error("Payment amount mismatch");
      if (payment.status !== "captured") throw new Error("Payment not captured");

      const endDate = new Date();
      if (plan === "monthly") endDate.setMonth(endDate.getMonth() + 1);
      else endDate.setFullYear(endDate.getFullYear() + 1);
      endDateIso = endDate.toISOString();
    }

    // Activate server-side
    const { error: upsertError } = await supabase.from("subscriptions").upsert({
      user_id: user.id,
      plan,
      status: "active",
      razorpay_subscription_id: activeSubscriptionId,
      razorpay_payment_id,
      amount,
      start_date: new Date().toISOString(),
      end_date: endDateIso,
    }, { onConflict: "user_id" });
    if (upsertError) throw new Error("Could not activate subscription");

    await supabase.from("user_profiles").update({ is_pro: true }).eq("id", user.id);

    return new Response(
      JSON.stringify({ success: true, end_date: endDateIso }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

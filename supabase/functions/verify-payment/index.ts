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

    // --- Cancel action ---
    if (body.action === "cancel") {
      const { error: cancelError } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", user.id);
      if (cancelError) throw new Error("Could not cancel subscription");

      await supabase.from("user_profiles").update({ is_pro: false }).eq("id", user.id);

      return new Response(JSON.stringify({ success: true, cancelled: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Verify payment ---
    const { plan, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const amount = PLAN_AMOUNTS[plan];
    if (!amount) throw new Error("Invalid plan");
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment details");
    }

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeyId || !razorpayKeySecret) throw new Error("Razorpay keys not configured");

    // 1. Verify the Razorpay signature (HMAC-SHA256 of order_id|payment_id)
    const expected = await hmacSha256(razorpayKeySecret, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (expected !== razorpay_signature) throw new Error("Invalid payment signature");

    // 2. Confirm the order exists, is paid, and matches the expected amount
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers: { "Authorization": `Basic ${auth}` },
    });
    if (!orderRes.ok) throw new Error("Could not verify order");
    const order = await orderRes.json();
    if (order.amount !== amount) throw new Error("Payment amount mismatch");

    const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: { "Authorization": `Basic ${auth}` },
    });
    if (!payRes.ok) throw new Error("Could not verify payment");
    const payment = await payRes.json();
    if (payment.status !== "captured" && payment.status !== "authorized") {
      throw new Error("Payment not captured");
    }

    // 3. Activate the subscription server-side
    const endDate = new Date();
    if (plan === "monthly") endDate.setMonth(endDate.getMonth() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    const { error: upsertError } = await supabase.from("subscriptions").upsert({
      user_id: user.id,
      plan,
      status: "active",
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
    }, { onConflict: "user_id" });
    if (upsertError) throw new Error("Could not activate subscription");

    await supabase.from("user_profiles").update({ is_pro: true }).eq("id", user.id);

    return new Response(JSON.stringify({ success: true, end_date: endDate.toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    // Webhooks are called by Razorpay servers (no user auth), so use the service role.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Verify the webhook signature over the RAW body
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!webhookSecret) throw new Error("Webhook secret not configured");

    const expected = await hmacSha256(webhookSecret, rawBody);
    if (expected !== signature) throw new Error("Invalid webhook signature");

    const body = JSON.parse(rawBody);
    const event = body.event;

    // Only these events mean real money was received
    if (event !== "payment.captured" && event !== "order.paid") {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const paymentEntity = body.payload?.payment?.entity;
    const orderEntity = body.payload?.order?.entity;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    if (!razorpayOrderId) throw new Error("Missing order id in webhook");

    // 2. Fetch the order from Razorpay (authoritative) to read user + plan + amount
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeyId || !razorpayKeySecret) throw new Error("Razorpay keys not configured");

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}`, {
      headers: { "Authorization": `Basic ${auth}` },
    });
    if (!orderRes.ok) throw new Error("Could not verify order");

    const order = await orderRes.json();
    const userId = order.notes?.user_id;
    const plan = order.notes?.plan;
    const amount = PLAN_AMOUNTS[plan];
    if (!userId) throw new Error("Order has no user id");
    if (!amount) throw new Error("Order has no valid plan");
    if (order.amount !== amount) throw new Error("Order amount mismatch");
    if (order.status !== "paid") throw new Error("Order is not paid");

    // 3. Activate the subscription server-side
    const endDate = new Date();
    if (plan === "monthly") endDate.setMonth(endDate.getMonth() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    const { error: upsertError } = await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan,
      status: "active",
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentEntity?.id || null,
      amount,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
    }, { onConflict: "user_id" });
    if (upsertError) throw new Error("Could not activate subscription");

    await supabase.from("user_profiles").update({ is_pro: true }).eq("id", userId);

    return new Response(JSON.stringify({ received: true, activated: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});

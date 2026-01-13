import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createOrder, findOrderBySession } from "../../../../lib/orders";
import { getTier } from "../../../../lib/pricing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const signature = request.headers.get("stripe-signature") || "";
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email;
    if (email) {
      const existing = await findOrderBySession(session.id);
      if (existing) {
        return NextResponse.json({ received: true }, { status: 200 });
      }
      const tierId = session.metadata?.tier_id ?? session.metadata?.product_tier ?? "";
      const tier = getTier(tierId);
      await createOrder({
        email,
        full_name: session.metadata?.full_name ?? null,
        stripe_session_id: session.id,
        stripe_payment_status: session.payment_status,
        tier_id: tier?.id ?? null,
        price_usd: tier?.priceUSD ?? null,
        included_features: tier?.flags ?? null,
        max_jobs: tier?.limits.maxJobs ?? null,
        status: "draft"
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

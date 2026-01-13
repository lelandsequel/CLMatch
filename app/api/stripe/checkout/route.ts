import Stripe from "stripe";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createOrder } from "../../../../lib/orders";
import { getTier } from "../../../../lib/pricing";
import { getStripePriceId } from "../../../../lib/stripe/prices";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    tierId?: string;
    tier?: string;
    email?: string;
    full_name?: string;
  };
  const tierId = body.tierId ?? body.tier ?? "";
  const tier = getTier(tierId);

  if (!tier) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get("origin") ?? "";

  if (process.env.STRIPE_DISABLED === "true") {
    const devSessionId = `dev_${randomUUID()}`;
    await createOrder({
      email: body.email ?? "dev@example.com",
      full_name: body.full_name ?? null,
      stripe_session_id: devSessionId,
      stripe_payment_status: "paid",
      tier_id: tier.id,
      price_usd: tier.priceUSD,
      included_features: tier.flags,
      max_jobs: tier.limits.maxJobs,
      status: "draft"
    });
    return NextResponse.json(
      { url: `/intake?dev=1&session_id=${devSessionId}&tier=${tier.id}` },
      { status: 200 }
    );
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = getStripePriceId(tier.id);

  if (!stripeKey || !priceId || !appUrl) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email,
    metadata: {
      tier_id: tier.id,
      full_name: body.full_name ?? ""
    },
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: `${appUrl}/intake?session_id={CHECKOUT_SESSION_ID}&tier=${tier.id}`,
    cancel_url: `${appUrl}/pricing`
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
}

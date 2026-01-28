import Stripe from "stripe";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createOrder } from "../../../../lib/orders";
import { getTier, type TierId } from "../../../../lib/pricing";
import { getStripePriceId } from "../../../../lib/stripe/prices";
import { getATSDiscountInfo } from "../../../../lib/stripe/ats-discount";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tierId?: string;
      tier?: string;
      email?: string;
      full_name?: string;
      successUrl?: string;
      cancelUrl?: string;
    };
    const tierId = body.tierId ?? body.tier ?? "";
    const tier = getTier(tierId);

    if (!tier) {
      return NextResponse.json({ error: "Invalid tier", tierId }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get("origin") ?? "";

    if (process.env.STRIPE_DISABLED === "true") {
      const devSessionId = `dev_${randomUUID()}`;
      const includedFeatures = { ...tier.flags, includesPivotPathways: tier.includesPivotPathways };
      await createOrder({
        email: body.email ?? "dev@example.com",
        full_name: body.full_name ?? null,
        stripe_session_id: devSessionId,
        stripe_payment_status: "paid",
        tier_id: tier.id,
        price_usd: tier.priceUSD,
        included_features: includedFeatures,
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
      return NextResponse.json({ 
        error: "Stripe not configured",
        debug: {
          hasStripeKey: !!stripeKey,
          hasPriceId: !!priceId,
          hasAppUrl: !!appUrl,
          tierId: tier.id
        }
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);

    // Check for ATS subscriber discount
    let discountInfo = { couponId: null as string | null, discountLabel: null as string | null };
    try {
      discountInfo = await getATSDiscountInfo(stripe, body.email, tier.id as TierId);
    } catch (discountErr) {
      // Non-fatal - continue without discount
      console.error("Discount check failed:", discountErr);
    }

    // Determine checkout mode - subscription for ATS monthly, payment for others
    const isSubscription = tier.isSubscription === true;
    const checkoutMode = isSubscription ? "subscription" : "payment";

    // Determine return URLs - ATS tiers go back to optimizer, others to intake
    const isATSTier = tier.isATSTier === true;
    const defaultSuccessUrl = isATSTier 
      ? `${appUrl}/ats-optimizer?session_id={CHECKOUT_SESSION_ID}&paid=true`
      : `${appUrl}/intake?session_id={CHECKOUT_SESSION_ID}&tier=${tier.id}`;
    const defaultCancelUrl = isATSTier ? `${appUrl}/ats-optimizer` : `${appUrl}/pricing`;

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: checkoutMode,
      customer_email: body.email,
      metadata: {
        tier_id: tier.id,
        full_name: body.full_name ?? "",
        ...(discountInfo.discountLabel && { discount_applied: discountInfo.discountLabel })
      },
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: body.successUrl || defaultSuccessUrl,
      cancel_url: body.cancelUrl || defaultCancelUrl
    };

    // Apply discount coupon if eligible
    if (discountInfo.couponId) {
      sessionConfig.discounts = [{ coupon: discountInfo.couponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

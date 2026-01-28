import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getTier, type TierId } from "../../../../lib/pricing";
import { getATSDiscountInfo } from "../../../../lib/stripe/ats-discount";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    tierId?: string;
    email?: string;
  };

  const { tierId, email } = body;

  if (!tierId || !email) {
    return NextResponse.json(
      { error: "tierId and email are required" },
      { status: 400 }
    );
  }

  const tier = getTier(tierId);
  if (!tier) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  if (process.env.STRIPE_DISABLED === "true") {
    return NextResponse.json({
      eligible: false,
      discountLabel: null,
      percentOff: 0,
    });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const discountInfo = await getATSDiscountInfo(stripe, email, tierId as TierId);

  return NextResponse.json({
    eligible: discountInfo.couponId !== null,
    discountLabel: discountInfo.discountLabel,
    percentOff: discountInfo.percentOff,
  });
}

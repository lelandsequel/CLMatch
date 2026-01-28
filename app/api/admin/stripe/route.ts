import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { isAdminUser } from "../../../../lib/admin";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const priceVars = {
      STRIPE_PRICE_JOB_RADAR_49: Boolean(process.env.STRIPE_PRICE_JOB_RADAR_49),
      STRIPE_PRICE_GHOST_PROOF_99: Boolean(process.env.STRIPE_PRICE_GHOST_PROOF_99),
      STRIPE_PRICE_INTERVIEW_BOOST_149: Boolean(process.env.STRIPE_PRICE_INTERVIEW_BOOST_149),
      STRIPE_PRICE_RAPID_LITE_199: Boolean(process.env.STRIPE_PRICE_RAPID_LITE_199),
      STRIPE_PRICE_PIVOT_PACK: Boolean(process.env.STRIPE_PRICE_PIVOT_PACK),
      STRIPE_PRICE_OFFER_REPORT_399: Boolean(process.env.STRIPE_PRICE_OFFER_REPORT_399),
      STRIPE_PRICE_OFFER_SPRINT_599: Boolean(process.env.STRIPE_PRICE_OFFER_SPRINT_599)
    };

    return NextResponse.json(
      {
        stripeDisabled: process.env.STRIPE_DISABLED === "true",
        keys: {
          STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
          STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
        },
        prices: priceVars,
        appUrl,
        webhookUrl: `${appUrl}/api/stripe/webhook`,
        stripeListenCmd: `stripe listen --forward-to ${appUrl}/api/stripe/webhook`
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

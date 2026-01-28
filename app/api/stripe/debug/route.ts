import { NextResponse } from "next/server";
import { listStripePriceEnvKeys } from "../../../../lib/stripe/prices";

export async function GET() {
  const envKeys = listStripePriceEnvKeys();
  const status: Record<string, boolean> = {};
  
  for (const key of envKeys) {
    status[key] = !!process.env[key];
  }
  
  return NextResponse.json({
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "(not set)",
    STRIPE_DISABLED: process.env.STRIPE_DISABLED ?? "(not set)",
    priceIds: status
  });
}

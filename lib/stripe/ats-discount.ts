import Stripe from "stripe";
import { isEligibleForATSDiscount, type TierId } from "../pricing";
import { getATSSubscriberCouponId } from "./prices";

/**
 * Check if an email has an active ATS monthly subscription
 */
export async function hasActiveATSSubscription(
  stripe: Stripe,
  email: string
): Promise<boolean> {
  try {
    // Find customer by email
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return false;
    }

    const customer = customers.data[0];

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 10,
    });

    // Check if any subscription is for ATS monthly
    const atsMonthlyPriceId = process.env.STRIPE_PRICE_ATS_MONTHLY;
    if (!atsMonthlyPriceId) return false;

    return subscriptions.data.some((sub) =>
      sub.items.data.some((item) => item.price.id === atsMonthlyPriceId)
    );
  } catch (error) {
    console.error("Error checking ATS subscription:", error);
    return false;
  }
}

/**
 * Get discount info for checkout
 * Returns coupon ID if user is eligible for ATS subscriber discount
 */
export async function getATSDiscountInfo(
  stripe: Stripe,
  email: string | undefined,
  tierId: TierId
): Promise<{
  couponId: string | null;
  discountLabel: string | null;
  percentOff: number;
}> {
  // Check if tier is eligible for discount ($199+)
  if (!isEligibleForATSDiscount(tierId)) {
    return { couponId: null, discountLabel: null, percentOff: 0 };
  }

  // Check if user has active ATS subscription
  if (!email) {
    return { couponId: null, discountLabel: null, percentOff: 0 };
  }

  const hasSubscription = await hasActiveATSSubscription(stripe, email);
  if (!hasSubscription) {
    return { couponId: null, discountLabel: null, percentOff: 0 };
  }

  const couponId = getATSSubscriberCouponId();
  if (!couponId) {
    return { couponId: null, discountLabel: null, percentOff: 0 };
  }

  return {
    couponId,
    discountLabel: "ATS Subscriber Discount (15% off)",
    percentOff: 15,
  };
}

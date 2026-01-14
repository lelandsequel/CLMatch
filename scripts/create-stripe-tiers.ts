import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

type TierConfig = {
  key: string;
  name: string;
  amount: number;
  currency: "usd";
  envVar: string;
};

const TIERS: TierConfig[] = [
  { key: "JOB_RADAR", name: "Job Radar", amount: 4900, currency: "usd", envVar: "STRIPE_PRICE_JOB_RADAR_49" },
  { key: "GHOST_PROOF", name: "Ghost-Proof Job List", amount: 9900, currency: "usd", envVar: "STRIPE_PRICE_GHOST_PROOF_99" },
  { key: "INTERVIEW_BOOST", name: "Interview Boost Kit", amount: 14900, currency: "usd", envVar: "STRIPE_PRICE_INTERVIEW_BOOST_149" },
  { key: "RAPID_LITE", name: "Rapid Offer Report Lite", amount: 19900, currency: "usd", envVar: "STRIPE_PRICE_RAPID_LITE_199" },
  { key: "PIVOT_PACK", name: "Pivot Pack", amount: 29900, currency: "usd", envVar: "STRIPE_PRICE_PIVOT_PACK" },
  { key: "OFFER_REPORT", name: "Offer Farming Report", amount: 39900, currency: "usd", envVar: "STRIPE_PRICE_OFFER_REPORT_399" },
  { key: "OFFER_SPRINT", name: "Offer Sprint", amount: 59900, currency: "usd", envVar: "STRIPE_PRICE_OFFER_SPRINT_599" },
];

async function findOrCreateProduct(tier: TierConfig) {
  const search = await stripe.products.search({
    query: `metadata['tier_key']:'${tier.key}'`,
    limit: 1,
  });
  const existing = search.data[0];
  if (existing) {
    return { product: existing, created: false };
  }
  const product = await stripe.products.create({
    name: `C&L Job Match — ${tier.name}`,
    metadata: { tier_key: tier.key },
  });
  return { product, created: true };
}

async function findOrCreatePrice(tier: TierConfig, productId: string) {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
  const existing = prices.data.find(
    (price) =>
      price.currency === tier.currency &&
      price.unit_amount === tier.amount &&
      price.type === "one_time"
  );
  if (existing) {
    return { price: existing, created: false };
  }
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: tier.amount,
    currency: tier.currency,
  });
  return { price, created: true };
}

(async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  console.log("Creating Stripe products + prices (idempotent)...\n");

  const envOutput: Array<{ envVar: string; priceId: string; tierKey: string }> = [];

  for (const tier of TIERS) {
    const { product, created: productCreated } = await findOrCreateProduct(tier);
    const { price, created: priceCreated } = await findOrCreatePrice(tier, product.id);

    console.log(`${tier.key}`);
    console.log(`  product: ${product.id} ${productCreated ? "(created)" : "(existing)"}`);
    console.log(`  price:   ${price.id} ${priceCreated ? "(created)" : "(existing)"}\n`);

    envOutput.push({ envVar: tier.envVar, priceId: price.id, tierKey: tier.key });
  }

  console.log("Env vars:");
  for (const entry of envOutput) {
    console.log(`${entry.envVar}=${entry.priceId}`);
  }
  console.log("\nDone.");
})();

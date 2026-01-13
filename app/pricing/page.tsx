import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { PageHeader } from "../../components/page-header";
import { Badge } from "../../components/ui/badge";
import PricingClient from "./PricingClient";
import { tiers } from "../../lib/pricing";
import { areStripePricesConfigured } from "../../lib/stripe/prices";

export default function PricingPage() {
  const quickWins = tiers.filter((tier) =>
    ["job_radar", "ghost_proof_list", "interview_boost_kit"].includes(tier.id)
  );
  const fullEngine = tiers.filter((tier) =>
    ["rapid_offer_lite", "offer_farming_report", "offer_sprint"].includes(tier.id)
  );
  const stripeDisabled = process.env.STRIPE_DISABLED === "true";
  const stripeReady = stripeDisabled
    ? true
    : Boolean(
        process.env.STRIPE_SECRET_KEY &&
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
          areStripePricesConfigured()
      );

  return (
    <AppShell>
      <Section className="py-16 md:py-24">
        <div className="max-w-2xl space-y-4">
          <Badge>Pricing</Badge>
          <PageHeader
            title="Choose your offer engine."
            subtitle="Real jobs only. Anti-ghost scoring. ATS-ready assets. Delivered fast."
          />
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Turnaround depends on intake quality and role volume. We only source from ATS systems
          (Greenhouse/Lever/Ashby/Workday). No scraped aggregator spam.
        </p>

        <PricingClient
          quickWins={quickWins}
          fullEngine={fullEngine}
          stripeDisabled={stripeDisabled}
          stripeReady={stripeReady}
        />
      </Section>
    </AppShell>
  );
}

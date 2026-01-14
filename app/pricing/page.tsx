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
    ["rapid_offer_lite", "pivot_pack", "offer_farming_report", "offer_sprint"].includes(tier.id)
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
      <Section className="relative py-20 md:py-28 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-radial from-gold/8 via-gold/3 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-radial from-amber/6 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-2xl space-y-5">
          <Badge variant="gold" className="animate-pulse-glow">Pricing</Badge>
          <PageHeader
            title="Choose your offer engine."
            subtitle="Real jobs only. Anti-ghost scoring. ATS-ready assets. Delivered fast."
          />
        </div>

        <p className="relative mt-6 text-sm text-ink-soft/70 dark:text-parchment-dark/60 max-w-2xl leading-relaxed">
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

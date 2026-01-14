import IntakeForm from "./IntakeForm";
import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { PageHeader } from "../../components/page-header";
import { Badge } from "../../components/ui/badge";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function IntakePage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const sessionId = typeof resolvedParams?.session_id === "string" ? resolvedParams?.session_id : "";
  const tier = typeof resolvedParams?.tier === "string" ? resolvedParams?.tier : "offer_farming_report";
  const devMode = process.env.STRIPE_DISABLED === "true" || resolvedParams?.dev === "1";
  const isAllowed = devMode || Boolean(sessionId);

  return (
    <AppShell>
      <Section className="relative py-16 md:py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-radial from-gold/6 via-gold/2 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-gradient-radial from-amber/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <Badge variant="gold">Premium Intake</Badge>
            <PageHeader
              title="Client Intake"
              subtitle="Paid clients only. This intake fuels the sourcing engine and report generation."
            />
          </div>
          
          {devMode ? (
            <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 to-amber/5 p-5 text-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <span className="text-gold-dark dark:text-gold font-medium">DEV MODE:</span>
              <span className="text-ink-soft/80 dark:text-parchment-dark/70">Stripe bypass enabled.</span>
            </div>
          ) : null}
          
          {!isAllowed ? (
            <div className="flex items-center gap-3 rounded-2xl border border-terracotta/30 bg-gradient-to-r from-terracotta/10 to-terracotta/5 p-5 text-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-terracotta" />
              <span className="text-terracotta">Missing Stripe session. Please return to pricing and complete checkout.</span>
            </div>
          ) : null}

          <IntakeForm sessionId={sessionId} tier={tier} devMode={devMode} isAllowed={isAllowed} />
        </div>
      </Section>
    </AppShell>
  );
}

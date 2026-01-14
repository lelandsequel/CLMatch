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
    <AppShell heroMode>
      <Section className="py-16 md:py-20">
        <div className="relative mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <Badge variant="gold">Premium Intake</Badge>
            <PageHeader
              title="Client Intake"
              subtitle="Paid clients only. This intake fuels the sourcing engine and report generation."
              className="text-on-dark"
            />
          </div>
          
          {devMode ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 backdrop-blur-sm p-5 text-sm">
              <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
              <span className="text-amber-200 font-medium">DEV MODE:</span>
              <span className="text-white/70">Stripe bypass enabled.</span>
            </div>
          ) : null}
          
          {!isAllowed ? (
            <div className="flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 backdrop-blur-sm p-5 text-sm">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-red-300">Missing Stripe session. Please return to pricing and complete checkout.</span>
            </div>
          ) : null}

          <IntakeForm sessionId={sessionId} tier={tier} devMode={devMode} isAllowed={isAllowed} />
        </div>
      </Section>
    </AppShell>
  );
}

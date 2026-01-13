import IntakeForm from "./IntakeForm";
import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { PageHeader } from "../../components/page-header";

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
      <Section className="py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <PageHeader
            title="Client Intake"
            subtitle="Paid clients only. This intake fuels the sourcing engine and report generation."
          />
          {devMode ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              DEV MODE: Stripe bypass enabled.
            </div>
          ) : null}
          {!isAllowed ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Missing Stripe session. Please return to pricing and complete checkout.
            </div>
          ) : null}

          <IntakeForm sessionId={sessionId} tier={tier} devMode={devMode} isAllowed={isAllowed} />
        </div>
      </Section>
    </AppShell>
  );
}

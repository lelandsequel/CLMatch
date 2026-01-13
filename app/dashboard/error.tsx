"use client";

import { useEffect } from "react";
import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { PageHeader } from "../../components/page-header";
import { Button } from "../../components/ui/button";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell>
      <Section className="py-24">
        <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-mist bg-white p-8 shadow-card">
          <PageHeader title="Dashboard error" subtitle="We can reload this view safely." />
          <Button onClick={reset}>Retry dashboard</Button>
        </div>
      </Section>
    </AppShell>
  );
}

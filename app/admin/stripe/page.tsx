"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMissingPublicEnv } from "../../env-check";
import { EnvMissingPanel } from "../../../components/env-missing-panel";
import { AppShell } from "../../../components/app-shell";
import { Section } from "../../../components/section";
import { PageHeader } from "../../../components/page-header";
import { Card } from "../../../components/ui/card";
import { AuthProvider, useSession } from "../../../components/auth/AuthProvider";

function AdminStripeContent() {
  const missingEnv = getMissingPublicEnv();
  const router = useRouter();
  const { session, user, loading: authLoading, isAdmin } = useSession();
  const [status, setStatus] = useState<{
    stripeDisabled: boolean;
    keys: Record<string, boolean>;
    prices: Record<string, boolean>;
    appUrl: string;
    webhookUrl: string;
    stripeListenCmd: string;
  } | null>(null);
  const [error, setError] = useState("");
  const forbidden = !authLoading && user && !isAdmin;

  useEffect(() => {
    if (missingEnv.length) return;
    if (authLoading) return;
    if (!user || !session?.access_token) {
      router.replace("/login?next=/admin/stripe");
      return;
    }
    if (!isAdmin) return;

    const load = async () => {
      const response = await fetch("/api/admin/stripe", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? "Forbidden");
        return;
      }
      setStatus(json);
    };

    load();
  }, [authLoading, isAdmin, missingEnv.length, router, session?.access_token, user]);

  return (
    <>
      <PageHeader title="Stripe readiness" subtitle="Live payment sanity check for go-live." />

      {forbidden ? (
        <Card className="mt-6 space-y-3 text-sm text-rose-600">
          <p>Not authorized.</p>
          <a href="/dashboard" className="underline">
            Back to dashboard
          </a>
        </Card>
      ) : null}

      {error ? (
        <Card className="mt-6 space-y-3 text-sm text-rose-600">
          <p>{error}</p>
        </Card>
      ) : null}

      {!error && !status && !forbidden ? (
        <Card className="mt-6 text-sm text-slate-500">Checking Stripe configuration...</Card>
      ) : null}

      {status ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="space-y-2 text-sm">
            <p>STRIPE_DISABLED: {status.stripeDisabled ? "✅" : "❌"}</p>
            {Object.entries(status.keys).map(([key, ok]) => (
              <p key={key}>
                {key}: {ok ? "✅" : "❌"}
              </p>
            ))}
            <p className="pt-2 text-xs text-slate-500">Price IDs</p>
            {Object.entries(status.prices).map(([key, ok]) => (
              <p key={key}>
                {key}: {ok ? "✅" : "❌"}
              </p>
            ))}
          </Card>
          <Card className="space-y-3 text-sm">
            <p className="font-semibold">Webhook setup</p>
            <p>Webhook URL: {status.webhookUrl}</p>
            <p className="text-xs text-slate-500">Stripe listen command:</p>
            <pre className="rounded-xl border border-mist bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
              {status.stripeListenCmd}
            </pre>
            <p className="text-xs text-slate-500">Set your Stripe dashboard webhook to the URL above.</p>
          </Card>
        </div>
      ) : null}
    </>
  );
}

export default function AdminStripePage() {
  const missingEnv = getMissingPublicEnv();

  return (
    <AppShell>
      <Section className="py-16">
        {missingEnv.length ? (
          <EnvMissingPanel missing={missingEnv} />
        ) : (
          <AuthProvider>
            <AdminStripeContent />
          </AuthProvider>
        )}
      </Section>
    </AppShell>
  );
}

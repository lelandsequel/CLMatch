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

function AdminHealthContent() {
  const missingEnv = getMissingPublicEnv();
  const router = useRouter();
  const { session, user, loading: authLoading, isAdmin } = useSession();
  const [status, setStatus] = useState<{
    supabase: boolean;
    buckets: { intakes: boolean; reports: boolean };
    env: { stripe: boolean; resend: boolean; jobSecret: boolean; openai: boolean };
    tables: Array<{ table: string; ok: boolean }>;
  } | null>(null);
  const [error, setError] = useState("");
  const forbidden = !authLoading && user && !isAdmin;

  useEffect(() => {
    if (missingEnv.length) return;
    if (authLoading) return;
    if (!user || !session?.access_token) {
      router.replace("/login?next=/admin/health");
      return;
    }
    if (!isAdmin) return;
    const load = async () => {
      const response = await fetch("/api/admin/health", {
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
      <PageHeader title="Production Health" subtitle="Quick sanity check for go-live." />

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
        <Card className="mt-6 text-sm text-slate-500">Checking system health...</Card>
      ) : null}

      {status ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="space-y-2 text-sm">
            <p>Supabase connection: {status.supabase ? "✅" : "❌"}</p>
            <p>Intakes bucket: {status.buckets.intakes ? "✅" : "❌"}</p>
            <p>Reports bucket: {status.buckets.reports ? "✅" : "❌"}</p>
            <p>Stripe env: {status.env.stripe ? "✅" : "❌"}</p>
            <p>Resend env: {status.env.resend ? "✅" : "❌"}</p>
            <p>JOB_PIPELINE_SECRET: {status.env.jobSecret ? "✅" : "❌"}</p>
            <p>OpenAI key (optional): {status.env.openai ? "✅" : "⚠️"}</p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Migrations</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {status.tables.map((item) => (
                <li key={item.table}>
                  {item.table}: {item.ok ? "✅" : "❌"}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}
    </>
  );
}

export default function AdminHealthPage() {
  const missingEnv = getMissingPublicEnv();

  return (
    <AppShell>
      <Section className="py-16">
        {missingEnv.length ? (
          <EnvMissingPanel missing={missingEnv} />
        ) : (
          <AuthProvider>
            <AdminHealthContent />
          </AuthProvider>
        )}
      </Section>
    </AppShell>
  );
}

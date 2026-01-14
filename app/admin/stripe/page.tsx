"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMissingPublicEnv } from "../../env-check";
import { EnvMissingPanel } from "../../../components/env-missing-panel";
import { AppShell } from "../../../components/app-shell";
import { Section } from "../../../components/section";
import { PageHeader } from "../../../components/page-header";
import { Card, CardPremium } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
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
      <PageHeader 
        title="Stripe readiness" 
        subtitle="Live payment sanity check for go-live."
        actions={
          <Link href="/admin">
            <Button variant="secondary">Back to Admin</Button>
          </Link>
        }
      />

      {forbidden ? (
        <Card className="mt-8 space-y-4 border-terracotta/30">
          <p className="text-sm text-terracotta font-medium">Not authorized.</p>
          <Link href="/dashboard" className="text-gold hover:text-gold-dark underline underline-offset-2 text-sm">
            Back to dashboard
          </Link>
        </Card>
      ) : null}

      {error ? (
        <Card className="mt-8 border-terracotta/30">
          <p className="text-sm text-terracotta">{error}</p>
        </Card>
      ) : null}

      {!error && !status && !forbidden ? (
        <Card className="mt-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <p className="text-sm text-ink-soft/80 dark:text-parchment-dark/70">Checking Stripe configuration...</p>
          </div>
        </Card>
      ) : null}

      {status ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Configuration Status Card */}
          <CardPremium className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-cream">Configuration</h3>
              <Badge variant={status.stripeDisabled ? "warning" : "success"}>
                {status.stripeDisabled ? "Dev Mode" : "Live"}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gold/10">
                <span className="text-sm text-ink-soft dark:text-parchment-dark">STRIPE_DISABLED</span>
                <span className={status.stripeDisabled ? "text-gold" : "text-sage"}>
                  {status.stripeDisabled ? "✅ Enabled" : "❌ Disabled"}
                </span>
              </div>
              
              {Object.entries(status.keys).map(([key, ok]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gold/10">
                  <span className="text-sm text-ink-soft dark:text-parchment-dark font-mono text-xs">{key}</span>
                  <span className={ok ? "text-sage" : "text-terracotta"}>
                    {ok ? "✅" : "❌"}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-gold/20">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-3">Price IDs</p>
              <div className="space-y-2">
                {Object.entries(status.prices).map(([key, ok]) => (
                  <div key={key} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-ink-soft/80 dark:text-parchment-dark/70 font-mono">{key}</span>
                    <span className={ok ? "text-sage text-xs" : "text-terracotta text-xs"}>
                      {ok ? "✅ Set" : "❌ Missing"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardPremium>
          
          {/* Webhook Setup Card */}
          <Card className="space-y-5">
            <h3 className="text-lg font-semibold text-ink dark:text-cream">Webhook setup</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-2">Webhook URL</p>
                <div className="rounded-xl border border-gold/20 bg-gradient-to-r from-cream/60 to-parchment/40 p-3 text-xs font-mono text-ink-soft break-all dark:from-navy/60 dark:to-navy-deep/40 dark:text-parchment-dark">
                  {status.webhookUrl}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-2">Stripe listen command</p>
                <pre className="rounded-xl border border-gold/20 bg-gradient-to-br from-ink to-ink-soft p-4 text-xs text-gold-light font-mono overflow-x-auto dark:from-navy-deep dark:to-navy">
                  {status.stripeListenCmd}
                </pre>
              </div>
              
              <div className="rounded-xl border border-gold/20 bg-gradient-to-r from-gold/5 to-amber/5 p-4">
                <p className="text-xs text-ink-soft/80 dark:text-parchment-dark/70 leading-relaxed">
                  <span className="font-semibold text-gold">Tip:</span> Set your Stripe dashboard webhook to the URL above for production, or use the CLI command for local development.
                </p>
              </div>
            </div>
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
      <Section className="relative py-16 md:py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-radial from-gold/6 via-gold/2 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-gradient-radial from-amber/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        
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

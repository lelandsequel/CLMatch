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
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { AuthProvider, useSession } from "../../../components/auth/AuthProvider";

/* Glass card component */
function GlassCard({ 
  children, 
  className = "",
  highlight = false
}: { 
  children: React.ReactNode; 
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-6 rounded-xl backdrop-blur-sm border transition-all ${
      highlight 
        ? "bg-white/15 border-amber-300/40" 
        : "bg-white/10 border-white/15"
    } ${className}`}>
      {children}
    </div>
  );
}

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
        className="text-on-dark"
        actions={
          <Link href="/admin">
            <Button variant="gold">Back to Admin</Button>
          </Link>
        }
      />

      {forbidden ? (
        <GlassCard className="mt-8 border-red-400/30 bg-red-500/10 space-y-4">
          <p className="text-sm text-red-300 font-medium">Not authorized.</p>
          <Link href="/dashboard" className="text-amber-300 hover:text-amber-200 underline underline-offset-2 text-sm">
            Back to dashboard
          </Link>
        </GlassCard>
      ) : null}

      {error ? (
        <GlassCard className="mt-8 border-red-400/30 bg-red-500/10">
          <p className="text-sm text-red-300">{error}</p>
        </GlassCard>
      ) : null}

      {!error && !status && !forbidden ? (
        <GlassCard className="mt-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
            <p className="text-sm text-white/70">Checking Stripe configuration...</p>
          </div>
        </GlassCard>
      ) : null}

      {status ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Configuration Status Card */}
          <GlassCard highlight className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Configuration</h3>
              <Badge variant={status.stripeDisabled ? "warning" : "success"}>
                {status.stripeDisabled ? "Dev Mode" : "Live"}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-sm text-white/70">STRIPE_DISABLED</span>
                <span className={status.stripeDisabled ? "text-amber-300" : "text-green-400"}>
                  {status.stripeDisabled ? "✅ Enabled" : "❌ Disabled"}
                </span>
              </div>
              
              {Object.entries(status.keys).map(([key, ok]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-sm text-white/60 font-mono text-xs">{key}</span>
                  <span className={ok ? "text-green-400" : "text-red-400"}>
                    {ok ? "✅" : "❌"}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-white/20">
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium mb-3">Price IDs</p>
              <div className="space-y-2">
                {Object.entries(status.prices).map(([key, ok]) => (
                  <div key={key} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-white/60 font-mono">{key}</span>
                    <span className={ok ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                      {ok ? "✅ Set" : "❌ Missing"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
          
          {/* Webhook Setup Card */}
          <GlassCard className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Webhook setup</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium mb-2">Webhook URL</p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-mono text-white/70 break-all">
                  {status.webhookUrl}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium mb-2">Stripe listen command</p>
                <pre className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-amber-200 font-mono overflow-x-auto">
                  {status.stripeListenCmd}
                </pre>
              </div>
              
              <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  <span className="font-semibold text-amber-300">Tip:</span> Set your Stripe dashboard webhook to the URL above for production, or use the CLI command for local development.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </>
  );
}

export default function AdminStripePage() {
  const missingEnv = getMissingPublicEnv();

  return (
    <AppShell heroMode>
      <Section className="py-16 md:py-20">
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

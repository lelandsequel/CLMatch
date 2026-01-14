"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "../../lib/supabase/client";
import { getMissingPublicEnv } from "../env-check";
import { EnvMissingPanel } from "../../components/env-missing-panel";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { Toast } from "../../components/ui/toast";
import { Card, CardPremium } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

function LoginContent() {
  const missingEnv = getMissingPublicEnv();
  const supabase = missingEnv.length ? null : createBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(nextPath);
      }
    };
    check();
  }, [supabase, router, nextPath]);

  const sendLink = async () => {
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase not configured.");
      return;
    }
    setStatus("idle");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      }
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      setToast({ message: error.message, type: "error" });
      return;
    }
    setStatus("sent");
    setToast({ message: "Magic link sent. Check your email.", type: "success" });
  };

  return (
    <>
      {missingEnv.length ? (
        <EnvMissingPanel missing={missingEnv} />
      ) : (
        <CardPremium className="mx-auto max-w-lg space-y-6 animate-fade-in-up">
          {/* Header */}
          <div className="space-y-3">
            <Badge variant="gold">Secure Access</Badge>
            <h1 className="text-3xl font-bold text-ink dark:text-cream tracking-tight">Client login</h1>
            <p className="text-sm text-ink-soft/80 dark:text-parchment-dark/70">
              Magic link access to your premium reports.
            </p>
          </div>
          
          {/* Decorative line */}
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-12 rounded-full bg-gradient-to-r from-gold to-gold-light" />
            <div className="h-0.5 w-3 rounded-full bg-gold/40" />
          </div>
          
          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">
                Email address
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            
            <Button variant="gold" onClick={sendLink} className="w-full">
              Send magic link
            </Button>
            
            {status === "sent" ? (
              <div className="flex items-center gap-3 rounded-xl border border-sage/30 bg-gradient-to-r from-sage/10 to-sage/5 p-4">
                <span className="h-2 w-2 rounded-full bg-sage animate-pulse" />
                <p className="text-sm text-sage font-medium">Magic link sent. Check your inbox.</p>
              </div>
            ) : null}
            
            {status === "error" ? (
              <div className="flex items-center gap-3 rounded-xl border border-terracotta/30 bg-gradient-to-r from-terracotta/10 to-terracotta/5 p-4">
                <span className="h-2 w-2 rounded-full bg-terracotta" />
                <p className="text-sm text-terracotta">{message}</p>
              </div>
            ) : null}
          </div>
          
          {/* Footer link */}
          <div className="pt-4 border-t border-gold/10">
            <Link 
              href="/" 
              className="text-sm text-ink-soft/60 hover:text-gold transition-colors duration-200 dark:text-parchment-dark/50"
            >
              ← Back to home
            </Link>
          </div>
        </CardPremium>
      )}
      {toast ? <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} /> : null}
    </>
  );
}

export default function LoginPage() {
  return (
    <AppShell>
      <Section className="relative py-20 md:py-28 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-gold/8 via-gold/3 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-gradient-radial from-amber/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <Suspense
          fallback={
            <Card className="mx-auto max-w-lg space-y-4 animate-pulse">
              <h1 className="text-3xl font-bold text-ink dark:text-cream">Client login</h1>
              <p className="text-sm text-ink-soft/60 dark:text-parchment-dark/50">Loading…</p>
            </Card>
          }
        >
          <LoginContent />
        </Suspense>
      </Section>
    </AppShell>
  );
}

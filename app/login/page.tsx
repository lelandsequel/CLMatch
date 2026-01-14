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
import { Badge } from "../../components/ui/badge";

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
    <div className={`p-8 rounded-xl backdrop-blur-sm border transition-all ${
      highlight 
        ? "bg-white/15 border-amber-300/40" 
        : "bg-white/10 border-white/15"
    } ${className}`}>
      {children}
    </div>
  );
}

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
        <GlassCard highlight className="mx-auto max-w-lg space-y-6 animate-fade-in-up">
          {/* Header */}
          <div className="space-y-3">
            <Badge variant="gold">Secure Access</Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Client login</h1>
            <p className="text-sm text-white/70">
              Magic link access to your premium reports.
            </p>
          </div>
          
          {/* Decorative line */}
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-200" />
            <div className="h-0.5 w-3 rounded-full bg-amber-300/40" />
          </div>
          
          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full h-12 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 text-sm text-white placeholder:text-white/40 focus:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/10 transition-all duration-200"
              />
            </div>
            
            <Button variant="gold" onClick={sendLink} className="w-full">
              Send magic link
            </Button>
            
            {status === "sent" ? (
              <div className="flex items-center gap-3 rounded-xl border border-green-400/30 bg-green-500/10 p-4">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-sm text-green-300 font-medium">Magic link sent. Check your inbox.</p>
              </div>
            ) : null}
            
            {status === "error" ? (
              <div className="flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <p className="text-sm text-red-300">{message}</p>
              </div>
            ) : null}
          </div>
          
          {/* Footer link */}
          <div className="pt-4 border-t border-white/10">
            <Link 
              href="/" 
              className="text-sm text-white/50 hover:text-amber-300 transition-colors duration-200"
            >
              ← Back to home
            </Link>
          </div>
        </GlassCard>
      )}
      {toast ? <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} /> : null}
    </>
  );
}

export default function LoginPage() {
  return (
    <AppShell heroMode>
      <Section className="py-20 md:py-28">
        <Suspense
          fallback={
            <GlassCard className="mx-auto max-w-lg space-y-4 animate-pulse">
              <h1 className="text-3xl font-bold text-white">Client login</h1>
              <p className="text-sm text-white/50">Loading…</p>
            </GlassCard>
          }
        >
          <LoginContent />
        </Suspense>
      </Section>
    </AppShell>
  );
}

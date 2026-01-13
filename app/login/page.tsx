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
        <div className="mx-auto max-w-lg rounded-xl border border-mist bg-white p-8 shadow-card">
          <h1 className="text-3xl font-semibold">Client login</h1>
          <p className="mt-2 text-sm text-slate-600">Magic link access to your report.</p>
          <div className="mt-6 space-y-4">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button onClick={sendLink} className="w-full">
              Send magic link
            </Button>
            {status === "sent" ? (
              <p className="text-sm text-emerald-600">Magic link sent. Check your inbox.</p>
            ) : null}
            {status === "error" ? (
              <p className="text-sm text-rose-600">{message}</p>
            ) : null}
          </div>
          <Link href="/" className="text-xs text-slate-500 underline">
            Back to home
          </Link>
        </div>
      )}
      {toast ? <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} /> : null}
    </>
  );
}

export default function LoginPage() {
  return (
    <AppShell>
      <Section className="py-20">
        <Suspense
          fallback={
            <div className="mx-auto max-w-lg rounded-xl border border-mist bg-white p-8 shadow-card">
              <h1 className="text-3xl font-semibold">Client login</h1>
              <p className="mt-2 text-sm text-slate-600">Loading…</p>
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </Section>
    </AppShell>
  );
}

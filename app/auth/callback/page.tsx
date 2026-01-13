"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createBrowserClient } from "../../../lib/supabase/client";
import { AppShell } from "../../../components/app-shell";
import { Section } from "../../../components/section";
import { PageHeader } from "../../../components/page-header";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Finalizing login…");

  useEffect(() => {
    const supabase = createBrowserClient();
    const run = async () => {
      if (!supabase) {
        setMessage("Supabase not configured.");
        return;
      }

      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") || "magiclink";
      const nextPath = searchParams.get("next") || "/dashboard";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          return;
        }
        router.replace(nextPath);
        return;
      }

      if (tokenHash) {
        const allowedTypes: EmailOtpType[] = ["magiclink", "signup", "recovery", "invite", "email_change"];
        const otpType = allowedTypes.includes(type as EmailOtpType) ? (type as EmailOtpType) : "magiclink";
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });
        if (error) {
          setMessage(error.message);
          return;
        }
        router.replace(nextPath);
        return;
      }

      setMessage("Missing auth code.");
    };

    run();
  }, [router, searchParams]);

  return <PageHeader title="Signing you in…" subtitle={message} />;
}

export default function AuthCallbackPage() {
  return (
    <AppShell>
      <Section className="py-20">
        <Suspense fallback={<PageHeader title="Signing you in…" subtitle="Finishing authentication…" />}>
          <AuthCallbackContent />
        </Suspense>
      </Section>
    </AppShell>
  );
}

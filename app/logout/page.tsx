"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "../../lib/supabase/client";
import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { PageHeader } from "../../components/page-header";
import { Toast } from "../../components/ui/toast";

export default function LogoutPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    const run = async () => {
      if (!supabase) {
        setToast({ message: "Supabase not configured.", type: "error" });
        return;
      }
      await supabase.auth.signOut();
      setToast({ message: "Signed out.", type: "success" });
      setTimeout(() => router.replace("/"), 800);
    };
    run();
  }, [router]);

  return (
    <AppShell>
      <Section className="py-20">
        <PageHeader title="Signing you out…" subtitle="See you soon." />
      </Section>
      {toast ? <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} /> : null}
    </AppShell>
  );
}

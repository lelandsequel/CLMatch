"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMissingPublicEnv } from "../env-check";
import { EnvMissingPanel } from "../../components/env-missing-panel";
import { PageHeader } from "../../components/page-header";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { AuthProvider, useSession } from "../../components/auth/AuthProvider";
import { getTier } from "../../lib/pricing";

type AdminOrder = {
  id: string;
  full_name?: string | null;
  email: string;
  product_tier?: string | null;
  tier_id?: string | null;
  max_jobs?: number | null;
  status: string;
  created_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getStatusVariant(status: string): "default" | "gold" | "premium" | "success" | "warning" {
  switch (status) {
    case "approved_auto":
    case "approved_manual":
    case "delivered":
      return "success";
    case "processing":
    case "qc_repairing":
      return "gold";
    case "needs_review":
    case "auto_qc_failed":
    case "failed":
      return "warning";
    default:
      return "default";
  }
}

/* Glass card component */
function GlassCard({ 
  children, 
  className = ""
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`p-6 rounded-xl backdrop-blur-sm bg-white/10 border border-white/15 ${className}`}>
      {children}
    </div>
  );
}

function AdminContent() {
  const missingEnv = getMissingPublicEnv();
  const router = useRouter();
  const { session, user, loading: authLoading, isAdmin } = useSession();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const forbidden = !authLoading && user && !isAdmin;

  useEffect(() => {
    if (missingEnv.length) return;
    if (authLoading) return;
    if (!user || !session?.access_token) {
      router.replace("/login?next=/admin");
      return;
    }
    if (!isAdmin) return;
    const load = async () => {
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? "Forbidden");
        setStatus("error");
        return;
      }
      setOrders(json.orders ?? []);
      setStatus("ready");
    };
    load();
  }, [authLoading, isAdmin, missingEnv.length, router, session?.access_token, user]);

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Review, regenerate, approve, and ship reports."
        className="text-on-dark"
        actions={
          <div className="flex gap-3">
            <Link href="/admin/health">
              <Button variant="gold">Health check</Button>
            </Link>
            <Link href="/admin/stripe">
              <Button variant="gold">Stripe status</Button>
            </Link>
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        }
      />

      {status === "loading" && !forbidden ? (
        <div className="mt-8 space-y-4 animate-fade-in-up">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : null}

      {forbidden ? (
        <GlassCard className="mt-8 border-red-400/30 bg-red-500/10 space-y-4">
          <p className="text-sm text-red-300 font-medium">Not authorized.</p>
          <Link href="/dashboard" className="text-amber-300 hover:text-amber-200 underline underline-offset-2 text-sm">
            Back to dashboard
          </Link>
        </GlassCard>
      ) : null}

      {status === "error" ? (
        <GlassCard className="mt-8 border-red-400/30 bg-red-500/10">
          <p className="text-sm text-red-300">{error}</p>
        </GlassCard>
      ) : null}

      {status === "ready" ? (
        <GlassCard className="mt-8 overflow-hidden">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">Client</th>
                  <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">Status</th>
                  <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">Tier</th>
                  <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">Created</th>
                  <th className="py-4 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className="border-b border-white/10 hover:bg-white/5 transition-colors duration-150 animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="py-5 pr-6">
                      <p className="font-medium text-white">{order.full_name ?? order.email}</p>
                      <p className="text-xs text-white/50">{order.email}</p>
                    </td>
                    <td className="py-5 pr-6">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-5 pr-6">
                      <p className="text-white/70">
                        {getTier(order.tier_id ?? order.product_tier ?? "")?.name ??
                          order.product_tier ??
                          "offer"}
                      </p>
                      {order.max_jobs ? (
                        <p className="text-xs text-white/50">{order.max_jobs} jobs</p>
                      ) : null}
                    </td>
                    <td className="py-5 pr-6 text-white/60">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-5">
                      <Link 
                        href={`/admin/${order.id}`} 
                        className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-300/20 hover:border-amber-300/50 transition-colors duration-200"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <p className="py-12 text-center text-sm text-white/50">
                No orders yet.
              </p>
            )}
          </div>
        </GlassCard>
      ) : null}
    </>
  );
}

export default function AdminPage() {
  const missingEnv = getMissingPublicEnv();

  return (
    <AppShell heroMode>
      <Section className="py-16 md:py-20">
        {missingEnv.length ? (
          <EnvMissingPanel missing={missingEnv} />
        ) : (
          <AuthProvider>
            <AdminContent />
          </AuthProvider>
        )}
      </Section>
    </AppShell>
  );
}

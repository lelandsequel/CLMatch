"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMissingPublicEnv } from "../env-check";
import { EnvMissingPanel } from "../../components/env-missing-panel";
import { PageHeader } from "../../components/page-header";
import { Card } from "../../components/ui/card";
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
        actions={
          <div className="flex gap-3">
            <Link href="/admin/health">
              <Button variant="secondary">Health check</Button>
            </Link>
            <Link href="/admin/stripe">
              <Button variant="secondary">Stripe status</Button>
            </Link>
            <Button variant="ghost" onClick={() => window.location.reload()}>
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
        <Card className="mt-8 space-y-4 border-terracotta/30">
          <p className="text-sm text-terracotta font-medium">Not authorized.</p>
          <Link href="/dashboard" className="text-gold hover:text-gold-dark underline underline-offset-2 text-sm">
            Back to dashboard
          </Link>
        </Card>
      ) : null}

      {status === "error" ? (
        <Card className="mt-8 border-terracotta/30">
          <p className="text-sm text-terracotta">{error}</p>
        </Card>
      ) : null}

      {status === "ready" ? (
        <Card className="mt-8 overflow-hidden">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Client</th>
                  <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Status</th>
                  <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Tier</th>
                  <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Created</th>
                  <th className="py-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className="border-b border-gold/10 hover:bg-gold/[0.03] transition-colors duration-150 animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="py-5 pr-6">
                      <p className="font-medium text-ink dark:text-cream">{order.full_name ?? order.email}</p>
                      <p className="text-xs text-ink-soft/60 dark:text-parchment-dark/50">{order.email}</p>
                    </td>
                    <td className="py-5 pr-6">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-5 pr-6">
                      <p className="text-ink-soft dark:text-parchment-dark">
                        {getTier(order.tier_id ?? order.product_tier ?? "")?.name ??
                          order.product_tier ??
                          "offer"}
                      </p>
                      {order.max_jobs ? (
                        <p className="text-xs text-ink-soft/60 dark:text-parchment-dark/50">{order.max_jobs} jobs</p>
                      ) : null}
                    </td>
                    <td className="py-5 pr-6 text-ink-soft/70 dark:text-parchment-dark/60">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-5">
                      <Link 
                        href={`/admin/${order.id}`} 
                        className="inline-flex items-center rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium text-gold hover:bg-gold/15 hover:border-gold/50 transition-colors duration-200"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <p className="py-12 text-center text-sm text-ink-soft/60 dark:text-parchment-dark/50">
                No orders yet.
              </p>
            )}
          </div>
        </Card>
      ) : null}
    </>
  );
}

export default function AdminPage() {
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
            <AdminContent />
          </AuthProvider>
        )}
      </Section>
    </AppShell>
  );
}

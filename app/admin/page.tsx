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
          <>
            <Link href="/admin/health">
              <Button variant="secondary">Health check</Button>
            </Link>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </>
        }
      />

      {status === "loading" && !forbidden ? (
        <div className="mt-6 grid gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : null}

      {forbidden ? (
        <Card className="mt-6 space-y-3 text-sm text-rose-600">
          <p>Not authorized.</p>
          <Link href="/dashboard" className="underline">
            Back to dashboard
          </Link>
        </Card>
      ) : null}

      {status === "error" ? (
        <Card className="mt-6 text-sm text-rose-600">{error}</Card>
      ) : null}

      {status === "ready" ? (
        <Card className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist text-left text-xs uppercase tracking-widest text-slate-400">
                <th className="py-3">Client</th>
                <th>Status</th>
                <th>Tier</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-mist/60">
                  <td className="py-4">
                    <p className="font-semibold">{order.full_name ?? order.email}</p>
                    <p className="text-xs text-slate-500">{order.email}</p>
                  </td>
                  <td className="text-xs uppercase tracking-widest text-slate-500">
                    {order.status}
                  </td>
                  <td>
                    {getTier(order.tier_id ?? order.product_tier ?? "")?.name ??
                      order.product_tier ??
                      "offer"}
                    {order.max_jobs ? (
                      <p className="text-xs text-slate-400">{order.max_jobs} jobs</p>
                    ) : null}
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <Link href={`/admin/${order.id}`} className="text-xs underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </>
  );
}

export default function AdminPage() {
  const missingEnv = getMissingPublicEnv();

  return (
    <AppShell>
      <Section className="py-16">
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

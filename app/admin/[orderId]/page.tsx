"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getMissingPublicEnv } from "../../env-check";
import { EnvMissingPanel } from "../../../components/env-missing-panel";
import { AppShell } from "../../../components/app-shell";
import { Section } from "../../../components/section";
import { PageHeader } from "../../../components/page-header";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Toast } from "../../../components/ui/toast";
import { Stepper } from "../../../components/stepper";
import { AuthProvider, useSession } from "../../../components/auth/AuthProvider";
import { getTier } from "../../../lib/pricing";
import { StatCard } from "../../../components/stat-card";

type AdminJob = {
  title: string;
  company_name: string;
  fit_score: number;
  ghost_risk_score: number;
};

type AdminOrder = {
  id: string;
  email: string;
  full_name?: string | null;
  status: string;
  product_tier?: string | null;
  tier_id?: string | null;
  max_jobs?: number | null;
  artifacts?: Array<{ id: string; kind: string; storage_path: string }>;
  admin_notes?: Array<{ id: string; note: string; created_at: string }>;
  qc_results?: Array<{
    id: string;
    confidence_total: number;
    confidence_resume: number;
    confidence_jobs: number;
    confidence_outreach: number;
    confidence_certs: number;
    hard_fail: boolean;
    flags: string[];
    created_at: string;
  }>;
  intakes?: Array<{
    id: string;
    target_titles?: string[] | null;
    resume_profile_json?: Record<string, unknown> | null;
    resume_ats_text?: string | null;
    resume_patch_notes?: string | null;
    keyword_map?: string[] | null;
    target_job_url?: string | null;
    target_jd?: string | null;
    preferences?: Record<string, unknown> | null;
    outreach_text?: string | null;
    gap_suggestions?: string[] | null;
    cert_suggestions?: string[] | null;
  }>;
  job_runs?: Array<{ jobs?: AdminJob[]; created_at?: string | null }>;
};

function AdminOrderContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const missingEnv = getMissingPublicEnv();
  const { session, user, loading: authLoading, isAdmin } = useSession();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [regenSection, setRegenSection] = useState("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const forbidden = !authLoading && user && !isAdmin;

  useEffect(() => {
    if (missingEnv.length) return;
    if (authLoading) return;
    if (!user || !session?.access_token) {
      router.replace(`/login?next=/admin/${orderId}`);
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
        return;
      }
      const found = (json.orders ?? []).find((item: AdminOrder) => item.id === orderId);
      setOrder(found ?? null);
    };
    load();
  }, [authLoading, isAdmin, missingEnv.length, orderId, router, session?.access_token, user]);

  const runAction = async (
    action: "approve" | "regenerate",
    section?: string,
    override?: boolean
  ) => {
    if (!session?.access_token) {
      setError("Supabase not configured.");
      return;
    }
    const confirmText = action === "approve"
      ? override
        ? "Override QC and ship?"
        : "Approve and send?"
      : "Regenerate report?";
    if (!window.confirm(confirmText)) return;

    const url = action === "approve"
      ? `/api/admin/orders/${orderId}/approve${override ? "?override=1" : ""}`
      : `/api/admin/orders/${orderId}/regenerate${section ? `?section=${section}` : ""}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    if (!response.ok) {
      setToast({ message: "Action failed", type: "error" });
      return;
    }
    setToast({ message: "Action complete", type: "success" });
  };

  const runQcAction = async (action: "rerun" | "repair") => {
    if (!session?.access_token) return;
    const confirmText = action === "repair" ? "Auto-repair and recheck QC?" : "Re-run QC?";
    if (!window.confirm(confirmText)) return;
    const response = await fetch(`/api/admin/orders/${orderId}/qc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ action })
    });
    if (!response.ok) {
      setToast({ message: "QC action failed", type: "error" });
      return;
    }
    setToast({ message: "QC updated", type: "success" });
  };

  const addNote = async () => {
    if (!session?.access_token || !note.trim()) return;
    const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ note })
    });
    if (!response.ok) {
      setToast({ message: "Failed to save note", type: "error" });
      return;
    }
    setNote("");
    setToast({ message: "Note saved", type: "success" });
  };

  if (forbidden) {
    return (
      <Card className="space-y-3 text-sm text-rose-600">
        <p>Not authorized.</p>
        <a href="/dashboard" className="underline">
          Back to dashboard
        </a>
      </Card>
    );
  }

  if (error) {
    return <p className="px-6 py-16 text-sm text-rose-600">{error}</p>;
  }

  if (!order) {
    return <p className="px-6 py-16 text-sm text-slate-600">Loading order...</p>;
  }

  const intake = order.intakes?.[0];
  const jobs = [...(order.job_runs ?? [])]
    .sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return bTime - aTime;
    })[0]?.jobs ?? [];
  const statusLabel =
    order.status === "processing" || order.status === "qc_repairing"
      ? "Sourcing"
      : order.status === "needs_review"
        ? "Needs Review"
        : order.status === "approved_manual" || order.status === "approved_auto" || order.status === "delivered"
          ? "Approved"
          : order.status === "auto_qc_failed" || order.status === "failed"
            ? "Needs Review"
            : "Draft";
  const latestQc = [...(order.qc_results ?? [])].sort((a, b) => {
    const aTime = a.created_at ? Date.parse(a.created_at) : 0;
    const bTime = b.created_at ? Date.parse(b.created_at) : 0;
    return bTime - aTime;
  })[0];
  const qcFlags = Array.isArray(latestQc?.flags) ? latestQc?.flags : [];

  return (
    <>
        <PageHeader
          title={`Order ${order.id}`}
          subtitle={`${order.email} · ${getTier(order.tier_id ?? order.product_tier ?? "")?.name ?? "Tier"}${order.max_jobs ? ` · ${order.max_jobs} jobs` : ""}`}
          actions={
            <>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-xl border border-mist px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  value={regenSection}
                  onChange={(event) => setRegenSection(event.target.value)}
                >
                  <option value="all">Regenerate: all</option>
                  <option value="jobs">Regenerate: jobs</option>
                  <option value="resume">Regenerate: resume</option>
                  <option value="outreach">Regenerate: outreach</option>
                </select>
                <Button variant="secondary" onClick={() => runAction("regenerate", regenSection)}>
                  Run
                </Button>
              </div>
              <Button onClick={() => runAction("approve")} disabled={Boolean(latestQc?.hard_fail)}>
                Approve &amp; send
              </Button>
              {latestQc?.hard_fail ? (
                <Button variant="secondary" onClick={() => runAction("approve", undefined, true)}>
                  Override and ship
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => runAction("regenerate", "all")}>
                Retry processing
              </Button>
            </>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
          <Card className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
              <Stepper status={statusLabel} />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Quality Control</p>
              {latestQc ? (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <StatCard
                      title="Confidence"
                      value={`${Math.round((latestQc.confidence_total ?? 0) * 100)}%`}
                    />
                    <StatCard title="Hard fail" value={latestQc.hard_fail ? "Yes" : "No"} />
                    <StatCard
                      title="Resume"
                      value={`${Math.round((latestQc.confidence_resume ?? 0) * 100)}%`}
                    />
                    <StatCard
                      title="Jobs"
                      value={`${Math.round((latestQc.confidence_jobs ?? 0) * 100)}%`}
                    />
                    <StatCard
                      title="Outreach"
                      value={`${Math.round((latestQc.confidence_outreach ?? 0) * 100)}%`}
                    />
                    <StatCard
                      title="Certs"
                      value={`${Math.round((latestQc.confidence_certs ?? 0) * 100)}%`}
                    />
                  </div>
                  <div className="space-y-2 text-xs text-slate-500">
                    {qcFlags.map((flag) => (
                      <p key={flag}>• {flag}</p>
                    ))}
                  </div>
                  {process.env.NODE_ENV !== "production" ? (
                    <details className="text-xs text-slate-500">
                      <summary className="cursor-pointer">View QC JSON</summary>
                      <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-mist bg-white p-3">
                        {JSON.stringify(latestQc, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No QC results yet.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => runQcAction("rerun")}>
                  Re-run QC
                </Button>
                <Button variant="secondary" onClick={() => runQcAction("repair")}>
                  Auto-repair and recheck
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Profile</p>
              <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-mist bg-white p-4 text-xs">
                {JSON.stringify(intake?.resume_profile_json ?? {}, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin notes</p>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-2 w-full rounded-xl border border-mist p-3 text-sm"
                rows={3}
              />
              <Button variant="secondary" onClick={addNote} className="mt-2">
                Save note
              </Button>
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                {(order.admin_notes ?? []).map((item) => (
                  <p key={item.id}>• {item.note}</p>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Artifacts</p>
              <div className="grid gap-3 md:grid-cols-2">
                {(order.artifacts ?? []).map((artifact) => (
                  <div key={artifact.id} className="rounded-xl border border-mist bg-white p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{artifact.kind}</p>
                    <p className="mt-2 text-xs text-slate-500 break-all">{artifact.storage_path}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Jobs</p>
              <div className="mt-4 space-y-3">
                {jobs.map((job, index) => (
                  <div key={`${job.title}-${index}`} className="rounded-xl border border-mist bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-xs text-slate-500">{job.company_name}</p>
                      </div>
                      <div className="text-xs text-slate-500">
                        Fit {job.fit_score} · Ghost {job.ghost_risk_score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

      {toast ? <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} /> : null}
    </>
  );
}

export default function AdminOrderPage() {
  const missingEnv = getMissingPublicEnv();

  return (
    <AppShell>
      <Section className="py-16">
        {missingEnv.length ? (
          <EnvMissingPanel missing={missingEnv} />
        ) : (
          <AuthProvider>
            <AdminOrderContent />
          </AuthProvider>
        )}
      </Section>
    </AppShell>
  );
}

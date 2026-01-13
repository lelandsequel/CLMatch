"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMissingPublicEnv } from "../env-check";
import { EnvMissingPanel } from "../../components/env-missing-panel";
import { PageHeader } from "../../components/page-header";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Stepper } from "../../components/stepper";
import { Skeleton } from "../../components/ui/skeleton";
import { FitBadge, GhostBadge, AtsBadge } from "../../components/badges";
import { CopyButton } from "../../components/copy-button";
import { useSession } from "../../components/auth/AuthProvider";
import { getTier } from "../../lib/pricing";

const statusMap: Record<string, "Parsing" | "Sourcing" | "Draft" | "Needs Review" | "Approved"> = {
  draft: "Draft",
  processing: "Sourcing",
  qc_repairing: "Sourcing",
  auto_qc_failed: "Needs Review",
  needs_review: "Needs Review",
  approved_auto: "Approved",
  approved_manual: "Approved",
  delivered: "Approved",
  failed: "Needs Review"
};

type Artifact = {
  id: string;
  kind: string;
  signed_url?: string;
};

type Intake = {
  target_titles: string[];
  outreach_text?: string | null;
  gap_suggestions?: string[] | null;
  cert_suggestions?: string[] | null;
};

type Job = {
  id?: string;
  title: string;
  company_name: string;
  fit_score: number;
  ghost_risk_score: number;
  ats_type?: string;
  apply_url?: string | null;
  recommended_apply_path?: string | null;
  reasons_ghost?: string[] | null;
};

type Order = {
  id: string;
  status:
    | "draft"
    | "processing"
    | "qc_repairing"
    | "auto_qc_failed"
    | "needs_review"
    | "approved_auto"
    | "approved_manual"
    | "delivered"
    | "failed";
  product_tier: string | null;
  tier_id?: string | null;
  max_jobs?: number | null;
  price_usd?: number | null;
  created_at?: string | null;
  artifacts: Artifact[];
  intakes?: Intake[];
  job_runs?: Array<{ jobs: Job[]; created_at?: string | null }>;
};

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function splitOutreach(text?: string | null) {
  if (!text) return { recruiter: "", hm: "" };
  const recruiterMatch = text.split(/Hiring manager outreach:/i);
  if (recruiterMatch.length > 1) {
    return {
      recruiter: recruiterMatch[0].replace(/Recruiter outreach:/i, "").trim(),
      hm: recruiterMatch[1].trim()
    };
  }
  return { recruiter: text, hm: text };
}

export default function DashboardClient() {
  const missingEnv = getMissingPublicEnv();
  const router = useRouter();
  const { session, user, loading: authLoading } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [fitMin, setFitMin] = useState(0);
  const [ghostMax, setGhostMax] = useState(100);
  const [atsFilter, setAtsFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (missingEnv.length) return;
    if (authLoading) return;
    if (!user || !session?.access_token) {
      router.replace(`/login?next=/dashboard`);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      const json = (await response.json()) as { orders?: Order[]; error?: string };
      if (!response.ok) {
        setError(json.error ?? "Failed to load orders");
        setLoading(false);
        return;
      }
      const dataOrders = json.orders ?? [];
      setOrders(dataOrders);
      setActiveOrderId(dataOrders[0]?.id ?? null);
      setLoading(false);
    };

    load();
  }, [authLoading, session?.access_token, user, router, missingEnv.length]);

  const activeOrder = orders.find((order) => order.id === activeOrderId) ?? orders[0];
  const intake = activeOrder?.intakes?.[0];
  const jobs = useMemo(() => {
    const runs = activeOrder?.job_runs ?? [];
    const sorted = [...runs].sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return bTime - aTime;
    });
    return sorted[0]?.jobs ?? [];
  }, [activeOrder]);
  const outreach = splitOutreach(intake?.outreach_text ?? "");
  const activeTier = getTier(activeOrder?.tier_id ?? activeOrder?.product_tier ?? "");
  const isPremium = Boolean(activeTier?.requiresHumanQA);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (job.fit_score < fitMin) return false;
      if (job.ghost_risk_score > ghostMax) return false;
      if (atsFilter !== "all" && job.ats_type !== atsFilter) return false;
      if (search) {
        const hay = `${job.title} ${job.company_name}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [jobs, fitMin, ghostMax, atsFilter, search]);

  if (missingEnv.length) {
    return <EnvMissingPanel missing={missingEnv} />;
  }

  if (authLoading || (loading && showSkeleton)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (loading && !showSkeleton) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-slate-600">Still loading your dashboard.</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-rose-600">{error}</p>
        {process.env.NODE_ENV !== "production" ? (
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        ) : null}
      </Card>
    );
  }

  if (!orders.length) {
    return (
      <Card className="space-y-3">
        <PageHeader title="Your Reports" subtitle="No reports yet. Start with pricing." />
        <Button onClick={() => (window.location.href = "/pricing")}>View pricing</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Your Reports" subtitle="Premium reports and live sourcing intelligence." />

      <div className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
        <div className="space-y-4">
          {orders.map((order) => {
            const tier = getTier(order.tier_id ?? order.product_tier ?? "");
            return (
              <Card
                key={order.id}
                className={`cursor-pointer ${activeOrderId === order.id ? "border-ink" : ""}`}
                onClick={() => setActiveOrderId(order.id)}
              >
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {tier?.name ?? order.product_tier ?? "Offer Report"}
                  </p>
                  <p className="text-lg font-semibold">{formatDate(order.created_at)}</p>
                  <Stepper status={statusMap[order.status]} />
                </div>
              </Card>
            );
          })}
        </div>

        {activeOrder ? (
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
                  <p className="text-lg font-semibold">{activeOrder.status.replace("_", " ")}</p>
                  {getTier(activeOrder.tier_id ?? activeOrder.product_tier ?? "") ? (
                    <p className="text-xs text-slate-500">
                      {getTier(activeOrder.tier_id ?? activeOrder.product_tier ?? "")?.name} ·{" "}
                      {activeOrder.max_jobs ? `${activeOrder.max_jobs} jobs` : "Tiered"}
                    </p>
                  ) : null}
                </div>
                <Stepper status={statusMap[activeOrder.status]} />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {activeOrder.artifacts.map((artifact) => (
                  <a
                    key={artifact.id}
                    href={artifact.signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-mist bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm hover:border-ink dark:border-slate-800 dark:bg-slate-900"
                  >
                    Download {artifact.kind.replace("_", " ")}
                  </a>
                ))}
              </div>
            </Card>

            {isPremium ? (
              <Card className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Executive QA Included</p>
                  <span className="rounded-full bg-ink px-3 py-1 text-xs uppercase tracking-widest text-white">
                    Executive QA Included
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">In Executive Review</p>
                <p className="text-xs text-slate-500">
                  A seasoned executive (15+ years) audits all outputs before delivery.
                </p>
                <p className="text-xs text-slate-500">Typically within 1-2 business days.</p>
                <div className="rounded-xl border border-mist bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  AI + human audit: We verify job quality, ATS alignment, and professional tone.
                </div>
              </Card>
            ) : null}

            {!isPremium && activeOrder.status === "processing" ? (
              <Card className="space-y-2 text-sm text-slate-600">
                <p>Automated QC is running.</p>
              </Card>
            ) : null}

            {!isPremium && activeOrder.status === "qc_repairing" ? (
              <Card className="space-y-2 text-sm text-slate-600">
                <p>Auto-repair in progress. We are tightening quality now.</p>
              </Card>
            ) : null}

            {!isPremium && activeOrder.status === "auto_qc_failed" ? (
              <Card className="space-y-3 text-sm text-rose-600">
                <p>We hit a quality issue. We will fix it or refund.</p>
                <Button variant="secondary">Contact support</Button>
              </Card>
            ) : null}

            {!isPremium && (activeOrder.status === "approved_auto" || activeOrder.status === "delivered") ? (
              <Card className="space-y-2 text-sm text-emerald-700">
                <p>Your report is ready.</p>
              </Card>
            ) : null}

            <Card className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">Job matches</h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  <input
                    className="rounded-xl border border-mist px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Search title/company"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <select
                    className="rounded-xl border border-mist px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                    value={fitMin}
                    onChange={(event) => setFitMin(Number(event.target.value))}
                  >
                    <option value={0}>Fit 0+</option>
                    <option value={60}>Fit 60+</option>
                    <option value={75}>Fit 75+</option>
                  </select>
                  <select
                    className="rounded-xl border border-mist px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                    value={ghostMax}
                    onChange={(event) => setGhostMax(Number(event.target.value))}
                  >
                    <option value={100}>Ghost max 100</option>
                    <option value={70}>Ghost max 70</option>
                    <option value={40}>Ghost max 40</option>
                  </select>
                  <select
                    className="rounded-xl border border-mist px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                    value={atsFilter}
                    onChange={(event) => setAtsFilter(event.target.value)}
                  >
                    <option value="all">All ATS</option>
                    <option value="greenhouse">Greenhouse</option>
                    <option value="lever">Lever</option>
                    <option value="ashby">Ashby</option>
                    <option value="workday">Workday</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-mist text-left text-xs uppercase tracking-widest text-slate-400">
                      <th className="py-3">Role</th>
                      <th>Scores</th>
                      <th>ATS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job, index) => (
                      <tr key={`${job.title}-${index}`} className="border-b border-mist/60">
                        <td className="py-4">
                          <p className="font-semibold">{job.title}</p>
                          <p className="text-xs text-slate-500">{job.company_name}</p>
                        </td>
                        <td className="space-y-2">
                          <FitBadge score={job.fit_score} />
                          <div title={(job.reasons_ghost ?? []).join(" | ")}
                            className="w-max">
                            <GhostBadge score={job.ghost_risk_score} />
                          </div>
                        </td>
                        <td>{job.ats_type ? <AtsBadge atsType={job.ats_type} /> : "-"}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {job.apply_url ? (
                              <a
                                href={job.apply_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-mist px-3 py-1 text-xs"
                              >
                                Apply
                              </a>
                            ) : null}
                            {outreach.recruiter ? (
                              <CopyButton text={outreach.recruiter} label="Recruiter" copiedLabel="Copied" />
                            ) : null}
                            {outreach.hm ? (
                              <CopyButton text={outreach.hm} label="Hiring mgr" copiedLabel="Copied" />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredJobs.length ? (
                  <p className="py-6 text-center text-sm text-slate-500">No jobs match filters.</p>
                ) : null}
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold">Outreach + improvements</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recruiter</p>
                    {outreach.recruiter ? (
                      <CopyButton text={outreach.recruiter} label="Copy" copiedLabel="Copied" />
                    ) : null}
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-mist bg-white p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                    {outreach.recruiter || ""}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hiring manager</p>
                    {outreach.hm ? (
                      <CopyButton text={outreach.hm} label="Copy" copiedLabel="Copied" />
                    ) : null}
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-mist bg-white p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                    {outreach.hm || ""}
                  </pre>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Skill gaps</p>
                  <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {(intake?.gap_suggestions ?? []).map((gap) => (
                      <li key={gap}>• {gap}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Certifications</p>
                  <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {(intake?.cert_suggestions ?? []).map((cert) => (
                      <li key={cert}>• {cert}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button variant="secondary">Request refresh</Button>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMissingPublicEnv } from "../env-check";
import { EnvMissingPanel } from "../../components/env-missing-panel";
import { PageHeader } from "../../components/page-header";
import { Card, CardPremium } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Stepper } from "../../components/stepper";
import { Skeleton } from "../../components/ui/skeleton";
import { FitBadge, GhostBadge, AtsBadge } from "../../components/badges";
import { CopyButton } from "../../components/copy-button";
import { useSession } from "../../components/auth/AuthProvider";
import { getTier } from "../../lib/pricing";
import { normalizePivotPathways } from "../../lib/pivotPathways";

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
  pivot_pathways_json?: Record<string, unknown> | null;
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
  qc_results?: Array<{
    id: string;
    confidence_total: number;
    hard_fail: boolean;
    created_at?: string | null;
  }>;
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
  const jobs = (() => {
    const runs = activeOrder?.job_runs ?? [];
    const sorted = [...runs].sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return bTime - aTime;
    });
    return sorted[0]?.jobs ?? [];
  })();
  const latestQc = (() => {
    const results = activeOrder?.qc_results ?? [];
    const sorted = [...results].sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return bTime - aTime;
    });
    return sorted[0];
  })();
  const outreach = splitOutreach(intake?.outreach_text ?? "");
  const activeTier = getTier(activeOrder?.tier_id ?? activeOrder?.product_tier ?? "");
  const isPremium = Boolean(activeTier?.requiresHumanQA);
  const pivotPathways = normalizePivotPathways(intake?.pivot_pathways_json);
  const pivots = pivotPathways?.pivots ?? [];

  const filteredJobs = jobs.filter((job) => {
    if (job.fit_score < fitMin) return false;
    if (job.ghost_risk_score > ghostMax) return false;
    if (atsFilter !== "all" && job.ats_type !== atsFilter) return false;
    if (search) {
      const hay = `${job.title} ${job.company_name}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  if (missingEnv.length) {
    return <EnvMissingPanel missing={missingEnv} />;
  }

  if (authLoading || (loading && showSkeleton)) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (loading && !showSkeleton) {
    return (
      <Card className="space-y-4">
        <p className="text-sm text-ink-soft/80 dark:text-parchment-dark/70">Still loading your dashboard.</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="space-y-4">
        <p className="text-sm text-terracotta">{error}</p>
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
      <Card className="space-y-5">
        <PageHeader title="Your Reports" subtitle="No reports yet. Start with pricing." />
        <Button variant="gold" onClick={() => (window.location.href = "/pricing")}>View pricing</Button>
      </Card>
    );
  }

  return (
    <div className="relative space-y-10">
      <PageHeader title="Your Reports" subtitle="Premium reports and live sourcing intelligence." />

      <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr]">
        {/* Order List Sidebar */}
        <div className="space-y-4">
          {orders.map((order, index) => {
            const tier = getTier(order.tier_id ?? order.product_tier ?? "");
            const isActive = activeOrderId === order.id;
            
            return (
              <Card
                key={order.id}
                className={`cursor-pointer transition-all duration-300 animate-fade-in-up ${
                  isActive 
                    ? "ring-2 ring-gold/50 border-gold/30 shadow-glow" 
                    : "hover:border-gold/20 hover:shadow-card"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setActiveOrderId(order.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">
                      {tier?.name ?? order.product_tier ?? "Offer Report"}
                    </p>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                    )}
                  </div>
                  <p className="text-lg font-semibold text-ink dark:text-cream">{formatDate(order.created_at)}</p>
                  {order.price_usd ? (
                    <p className="text-xs text-ink-soft/60 dark:text-parchment-dark/50">${order.price_usd} paid</p>
                  ) : null}
                  <Stepper status={statusMap[order.status]} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Active Order Details */}
        {activeOrder ? (
          <div className="space-y-6">
            {/* Status Card */}
            <CardPremium className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Status</p>
                  <p className="text-xl font-semibold text-ink dark:text-cream capitalize">
                    {activeOrder.status.replace("_", " ")}
                  </p>
                  {getTier(activeOrder.tier_id ?? activeOrder.product_tier ?? "") ? (
                    <p className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">
                      {getTier(activeOrder.tier_id ?? activeOrder.product_tier ?? "")?.name} ·{" "}
                      {activeOrder.max_jobs ? `${activeOrder.max_jobs} jobs` : "Tiered"}
                    </p>
                  ) : null}
                  {activeOrder.price_usd ? (
                    <p className="text-xs text-ink-soft/60 dark:text-parchment-dark/50">${activeOrder.price_usd} paid</p>
                  ) : null}
                </div>
                <Stepper status={statusMap[activeOrder.status]} />
              </div>
              
              {latestQc ? (
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gold/10">
                  <Badge variant="premium">
                    QC {Math.round((latestQc.confidence_total ?? 0) * 100)}%
                  </Badge>
                  {latestQc.hard_fail ? (
                    <span className="text-xs text-terracotta font-medium">QC flags detected</span>
                  ) : null}
                </div>
              ) : null}

              {/* Artifacts Download */}
              {activeOrder.artifacts.length > 0 && (
                <div className="grid gap-3 md:grid-cols-3 pt-4 border-t border-gold/10">
                  {activeOrder.artifacts.map((artifact) => (
                    <a
                      key={artifact.id}
                      href={artifact.signed_url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-gold/20 bg-gradient-to-r from-cream/60 to-parchment/40 px-4 py-3 text-sm font-medium text-ink hover:border-gold/40 hover:shadow-soft transition-all duration-200 dark:from-navy/60 dark:to-navy-deep/40 dark:text-cream"
                    >
                      <span className="flex-shrink-0 h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors duration-200">
                        ↓
                      </span>
                      <span>Download {artifact.kind.replace("_", " ")}</span>
                    </a>
                  ))}
                </div>
              )}
            </CardPremium>

            {/* Executive QA Card */}
            {isPremium ? (
              <Card className="relative overflow-hidden space-y-4">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-radial from-gold/10 to-transparent rounded-full blur-2xl" />
                
                <div className="relative flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Executive QA Included</p>
                  <Badge variant="premium">Executive QA</Badge>
                </div>
                <p className="text-sm font-medium text-ink dark:text-cream">In Executive Review</p>
                <p className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">
                  A seasoned executive (15+ years) audits all outputs before delivery.
                </p>
                <p className="text-xs text-ink-soft/60 dark:text-parchment-dark/50">Typically within 1-2 business days.</p>
                <div className="rounded-xl border border-gold/20 bg-gradient-to-r from-cream/60 to-parchment/40 p-4 text-xs text-ink-soft/80 dark:from-navy/60 dark:to-navy-deep/40 dark:text-parchment-dark/70">
                  AI + human audit: We verify job quality, ATS alignment, and professional tone.
                </div>
              </Card>
            ) : null}

            {/* Processing Status Cards */}
            {!isPremium && activeOrder.status === "processing" ? (
              <Card className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                  <p className="text-sm text-ink-soft/80 dark:text-parchment-dark/70">Automated QC is running.</p>
                </div>
              </Card>
            ) : null}

            {!isPremium && activeOrder.status === "qc_repairing" ? (
              <Card className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
                  <p className="text-sm text-ink-soft/80 dark:text-parchment-dark/70">Auto-repair in progress. We are tightening quality now.</p>
                </div>
              </Card>
            ) : null}

            {!isPremium && activeOrder.status === "auto_qc_failed" ? (
              <Card className="space-y-4 border-terracotta/30">
                <p className="text-sm text-terracotta font-medium">We hit a quality issue. We will fix it or refund.</p>
                <Button variant="secondary">Contact support</Button>
              </Card>
            ) : null}

            {!isPremium && (activeOrder.status === "approved_auto" || activeOrder.status === "delivered") ? (
              <Card className="space-y-2 border-sage/30">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-sage" />
                  <p className="text-sm text-sage font-medium">Your report is ready.</p>
                </div>
              </Card>
            ) : null}

            {/* Job Matches Card */}
            <Card className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-ink dark:text-cream">Job matches</h3>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <input
                    className="h-10 rounded-xl border border-gold/20 bg-gradient-to-r from-cream/80 to-parchment/60 px-4 text-sm text-ink placeholder:text-ink-soft/40 focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all duration-200 dark:from-navy/80 dark:to-navy-deep/60 dark:text-cream dark:border-gold/10"
                    placeholder="Search title/company"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <select
                    className="h-10 rounded-xl border border-gold/20 bg-gradient-to-r from-cream/80 to-parchment/60 px-3 text-sm text-ink focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all duration-200 dark:from-navy/80 dark:to-navy-deep/60 dark:text-cream dark:border-gold/10"
                    value={fitMin}
                    onChange={(event) => setFitMin(Number(event.target.value))}
                  >
                    <option value={0}>Fit 0+</option>
                    <option value={60}>Fit 60+</option>
                    <option value={75}>Fit 75+</option>
                  </select>
                  <select
                    className="h-10 rounded-xl border border-gold/20 bg-gradient-to-r from-cream/80 to-parchment/60 px-3 text-sm text-ink focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all duration-200 dark:from-navy/80 dark:to-navy-deep/60 dark:text-cream dark:border-gold/10"
                    value={ghostMax}
                    onChange={(event) => setGhostMax(Number(event.target.value))}
                  >
                    <option value={100}>Ghost max 100</option>
                    <option value={70}>Ghost max 70</option>
                    <option value={40}>Ghost max 40</option>
                  </select>
                  <select
                    className="h-10 rounded-xl border border-gold/20 bg-gradient-to-r from-cream/80 to-parchment/60 px-3 text-sm text-ink focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/10 transition-all duration-200 dark:from-navy/80 dark:to-navy-deep/60 dark:text-cream dark:border-gold/10"
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

              {/* Jobs Table */}
              <div className="max-h-[420px] overflow-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gradient-to-r from-white/95 to-cream/95 dark:from-navy/95 dark:to-navy-deep/95 backdrop-blur-sm">
                    <tr className="border-b border-gold/20">
                      <th className="py-4 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Role</th>
                      <th className="py-4 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Scores</th>
                      <th className="py-4 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">ATS</th>
                      <th className="py-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job, index) => (
                      <tr 
                        key={`${job.title}-${index}`} 
                        className="border-b border-gold/10 hover:bg-gold/[0.03] transition-colors duration-150"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-medium text-ink dark:text-cream">{job.title}</p>
                          <p className="text-xs text-ink-soft/60 dark:text-parchment-dark/50">{job.company_name}</p>
                        </td>
                        <td className="py-4 pr-4 space-y-2">
                          <FitBadge score={job.fit_score} />
                          <div title={(job.reasons_ghost ?? []).join(" | ")} className="w-max">
                            <GhostBadge score={job.ghost_risk_score} />
                          </div>
                        </td>
                        <td className="py-4 pr-4">{job.ats_type ? <AtsBadge atsType={job.ats_type} /> : "-"}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {job.apply_url ? (
                              <a
                                href={job.apply_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium text-gold hover:bg-gold/15 hover:border-gold/50 transition-colors duration-200"
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
                  <p className="py-8 text-center text-sm text-ink-soft/60 dark:text-parchment-dark/50">No jobs match filters.</p>
                ) : null}
              </div>
            </Card>

            {/* Outreach + Improvements Card */}
            <Card className="space-y-5">
              <h3 className="text-lg font-semibold text-ink dark:text-cream">Outreach + improvements</h3>
              
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Recruiter</p>
                    {outreach.recruiter ? (
                      <CopyButton text={outreach.recruiter} label="Copy" copiedLabel="Copied" />
                    ) : null}
                  </div>
                  <pre className="whitespace-pre-wrap rounded-xl border border-gold/20 bg-gradient-to-br from-cream/60 to-parchment/40 p-4 text-xs text-ink-soft leading-relaxed dark:from-navy/60 dark:to-navy-deep/40 dark:text-parchment-dark">
                    {outreach.recruiter || ""}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Hiring manager</p>
                    {outreach.hm ? (
                      <CopyButton text={outreach.hm} label="Copy" copiedLabel="Copied" />
                    ) : null}
                  </div>
                  <pre className="whitespace-pre-wrap rounded-xl border border-gold/20 bg-gradient-to-br from-cream/60 to-parchment/40 p-4 text-xs text-ink-soft leading-relaxed dark:from-navy/60 dark:to-navy-deep/40 dark:text-parchment-dark">
                    {outreach.hm || ""}
                  </pre>
                </div>
              </div>
              
              <div className="grid gap-5 md:grid-cols-2 pt-5 border-t border-gold/10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-3">Skill gaps</p>
                  <ul className="space-y-2 text-sm text-ink-soft/80 dark:text-parchment-dark/70">
                    {(intake?.gap_suggestions ?? []).map((gap) => (
                      <li key={gap} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-amber/60" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-3">Certifications</p>
                  <ul className="space-y-2 text-sm text-ink-soft/80 dark:text-parchment-dark/70">
                    {(intake?.cert_suggestions ?? []).map((cert) => (
                      <li key={cert} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-sage/60" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Button variant="secondary">Request refresh</Button>
            </Card>

            {/* Pivot Pathways Card */}
            {pivots.length ? (
              <Card className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-ink dark:text-cream">Pivot Pathways™</h3>
                  <Badge variant="premium">Pivot Pathways™</Badge>
                </div>
                
                <div className="grid gap-4">
                  {pivots.slice(0, 4).map((pivot, index) => (
                    <div
                      key={`${pivot.industry}-${index}`}
                      className="group rounded-xl border border-gold/20 bg-gradient-to-br from-cream/60 to-parchment/40 p-5 hover:border-gold/40 hover:shadow-soft transition-all duration-300 dark:from-navy/60 dark:to-navy-deep/40"
                    >
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">{pivot.industry}</p>
                      <p className="mt-2 font-semibold text-ink dark:text-cream">
                        {pivot.role_titles.slice(0, 6).join(" · ")}
                      </p>
                      
                      <div className="mt-4 grid gap-5 md:grid-cols-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 font-medium mb-2">Why you fit</p>
                          <ul className="space-y-1.5 text-xs text-ink-soft/80 dark:text-parchment-dark/70">
                            {pivot.why_you_fit.slice(0, 5).map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span className="flex-shrink-0 mt-1 h-1 w-1 rounded-full bg-sage" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 font-medium mb-2">Pivot narrative</p>
                          <ul className="space-y-1.5 text-xs text-ink-soft/80 dark:text-parchment-dark/70">
                            {pivot.pivot_narrative_bullets.slice(0, 5).map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span className="flex-shrink-0 mt-1 h-1 w-1 rounded-full bg-gold/40" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {pivot.recommended_certs.length ? (
                        <div className="mt-4 pt-4 border-t border-gold/10">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 font-medium mb-3">Cert stack</p>
                          <div className="flex flex-wrap gap-2">
                            {pivot.recommended_certs.slice(0, 4).map((cert) => (
                              <a
                                key={`${cert.name}-${cert.url}`}
                                href={cert.url}
                                target="_blank"
                                rel="noreferrer"
                                title={cert.why_it_matters}
                                className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] text-gold hover:bg-gold/15 hover:border-gold/50 transition-colors duration-200"
                              >
                                {cert.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

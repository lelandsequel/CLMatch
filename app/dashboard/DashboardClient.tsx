"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMissingPublicEnv } from "../env-check";
import { EnvMissingPanel } from "../../components/env-missing-panel";
import { PageHeader } from "../../components/page-header";
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

/* Glass card component for dashboard */
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
    <div className={`p-6 rounded-xl backdrop-blur-sm border transition-all ${
      highlight 
        ? "bg-white/15 border-amber-300/40" 
        : "bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/25"
    } ${className}`}>
      {children}
    </div>
  );
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
      <GlassCard className="space-y-4">
        <p className="text-sm text-white/70">Still loading your dashboard.</p>
        <Button variant="gold" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="space-y-4">
        <p className="text-sm text-red-400">{error}</p>
        {process.env.NODE_ENV !== "production" ? (
          <Button variant="gold" onClick={() => window.location.reload()}>
            Retry
          </Button>
        ) : null}
      </GlassCard>
    );
  }

  if (!orders.length) {
    return (
      <GlassCard className="space-y-5">
        <PageHeader title="Your Reports" subtitle="No reports yet. Start with pricing." className="text-on-dark" />
        <Button variant="gold" onClick={() => (window.location.href = "/pricing")}>View pricing</Button>
      </GlassCard>
    );
  }

  return (
    <div className="relative space-y-10">
      <PageHeader title="Your Reports" subtitle="Premium reports and live sourcing intelligence." className="text-on-dark" />

      <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr]">
        {/* Order List Sidebar */}
        <div className="space-y-4">
          {orders.map((order, index) => {
            const tier = getTier(order.tier_id ?? order.product_tier ?? "");
            const isActive = activeOrderId === order.id;
            
            return (
              <div
                key={order.id}
                className={`cursor-pointer p-5 rounded-xl backdrop-blur-sm border transition-all duration-300 animate-fade-in-up ${
                  isActive 
                    ? "bg-white/15 border-amber-300/40 ring-1 ring-amber-300/20" 
                    : "bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/25"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setActiveOrderId(order.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">
                      {tier?.name ?? order.product_tier ?? "Offer Report"}
                    </p>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
                    )}
                  </div>
                  <p className="text-lg font-semibold text-white">{formatDate(order.created_at)}</p>
                  {order.price_usd ? (
                    <p className="text-xs text-white/50">${order.price_usd} paid</p>
                  ) : null}
                  <Stepper status={statusMap[order.status]} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Order Details */}
        {activeOrder ? (
          <div className="space-y-6">
            {/* Status Card */}
            <GlassCard highlight className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">Status</p>
                  <p className="text-xl font-semibold text-white capitalize">
                    {activeOrder.status.replace("_", " ")}
                  </p>
                  {getTier(activeOrder.tier_id ?? activeOrder.product_tier ?? "") ? (
                    <p className="text-xs text-white/60">
                      {activeOrder.max_jobs ? `${activeOrder.max_jobs} jobs` : "Tiered"}
                    </p>
                  ) : null}
                  {activeOrder.price_usd ? (
                    <p className="text-xs text-white/50">${activeOrder.price_usd} paid</p>
                  ) : null}
                </div>
                <Stepper status={statusMap[activeOrder.status]} />
              </div>
              
              {latestQc ? (
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <Badge variant="gold">
                    QC {Math.round((latestQc.confidence_total ?? 0) * 100)}%
                  </Badge>
                  {latestQc.hard_fail ? (
                    <span className="text-xs text-red-400 font-medium">QC flags detected</span>
                  ) : null}
                </div>
              ) : null}

              {/* Artifacts Download */}
              {activeOrder.artifacts.length > 0 && (
                <div className="grid gap-3 md:grid-cols-3 pt-4 border-t border-white/10">
                  {activeOrder.artifacts.map((artifact) => (
                    <a
                      key={artifact.id}
                      href={artifact.signed_url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-medium text-white hover:bg-amber-300/20 hover:border-amber-300/50 transition-all duration-200"
                    >
                      <span className="flex-shrink-0 h-8 w-8 rounded-lg bg-amber-300/20 flex items-center justify-center text-amber-300 group-hover:bg-amber-300/30 transition-colors duration-200">
                        ↓
                      </span>
                      <span>Download {artifact.kind.replace("_", " ")}</span>
                    </a>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Executive QA Card */}
            {isPremium ? (
              <GlassCard className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">Executive QA Included</p>
                  <Badge variant="gold">Executive QA</Badge>
                </div>
                <p className="text-sm font-medium text-white">In Executive Review</p>
                <p className="text-xs text-white/60">
                  A seasoned executive (15+ years) audits all outputs before delivery.
                </p>
                <p className="text-xs text-white/50">Typically within 1-2 business days.</p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                  AI + human audit: We verify job quality, ATS alignment, and professional tone.
                </div>
              </GlassCard>
            ) : null}

            {/* Processing Status Cards */}
            {!isPremium && activeOrder.status === "processing" ? (
              <GlassCard className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
                  <p className="text-sm text-white/70">Automated QC is running.</p>
                </div>
              </GlassCard>
            ) : null}

            {!isPremium && activeOrder.status === "qc_repairing" ? (
              <GlassCard className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-sm text-white/70">Auto-repair in progress. We are tightening quality now.</p>
                </div>
              </GlassCard>
            ) : null}

            {!isPremium && activeOrder.status === "auto_qc_failed" ? (
              <div className="p-6 rounded-xl backdrop-blur-sm bg-red-500/10 border border-red-400/30 space-y-4">
                <p className="text-sm text-red-300 font-medium">We hit a quality issue. We will fix it or refund.</p>
                <Button variant="gold">Contact support</Button>
              </div>
            ) : null}

            {!isPremium && (activeOrder.status === "approved_auto" || activeOrder.status === "delivered") ? (
              <div className="p-6 rounded-xl backdrop-blur-sm bg-green-500/10 border border-green-400/30 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <p className="text-sm text-green-300 font-medium">Your report is ready.</p>
                </div>
              </div>
            ) : null}

            {/* Job Matches Card */}
            <GlassCard className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Job matches</h3>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <input
                    className="h-10 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 text-sm text-white placeholder:text-white/40 focus:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/10 transition-all duration-200"
                    placeholder="Search title/company"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <select
                    className="h-10 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 text-sm text-white focus:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/10 transition-all duration-200"
                    value={fitMin}
                    onChange={(event) => setFitMin(Number(event.target.value))}
                  >
                    <option value={0}>Fit 0+</option>
                    <option value={60}>Fit 60+</option>
                    <option value={75}>Fit 75+</option>
                  </select>
                  <select
                    className="h-10 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 text-sm text-white focus:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/10 transition-all duration-200"
                    value={ghostMax}
                    onChange={(event) => setGhostMax(Number(event.target.value))}
                  >
                    <option value={100}>Ghost max 100</option>
                    <option value={70}>Ghost max 70</option>
                    <option value={40}>Ghost max 40</option>
                  </select>
                  <select
                    className="h-10 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 text-sm text-white focus:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/10 transition-all duration-200"
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
                  <thead className="sticky top-0 bg-black/40 backdrop-blur-sm">
                    <tr className="border-b border-white/20">
                      <th className="py-4 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">Role</th>
                      <th className="py-4 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">Scores</th>
                      <th className="py-4 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">ATS</th>
                      <th className="py-4 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job, index) => (
                      <tr 
                        key={`${job.title}-${index}`} 
                        className="border-b border-white/10 hover:bg-white/5 transition-colors duration-150"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-medium text-white">{job.title}</p>
                          <p className="text-xs text-white/50">{job.company_name}</p>
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
                                className="rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-300/20 hover:border-amber-300/50 transition-colors duration-200"
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
                  <p className="py-8 text-center text-sm text-white/50">No jobs match filters.</p>
                ) : null}
              </div>
            </GlassCard>

            {/* Outreach + Improvements Card */}
            <GlassCard className="space-y-5">
              <h3 className="text-lg font-semibold text-white">Outreach + improvements</h3>
              
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">Recruiter</p>
                    {outreach.recruiter ? (
                      <CopyButton text={outreach.recruiter} label="Copy" copiedLabel="Copied" />
                    ) : null}
                  </div>
                  <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 leading-relaxed">
                    {outreach.recruiter || ""}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">Hiring manager</p>
                    {outreach.hm ? (
                      <CopyButton text={outreach.hm} label="Copy" copiedLabel="Copied" />
                    ) : null}
                  </div>
                  <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 leading-relaxed">
                    {outreach.hm || ""}
                  </pre>
                </div>
              </div>
              
              <div className="grid gap-5 md:grid-cols-2 pt-5 border-t border-white/10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium mb-3">Skill gaps</p>
                  <ul className="space-y-2 text-sm text-white/70">
                    {(intake?.gap_suggestions ?? []).map((gap) => (
                      <li key={gap} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium mb-3">Certifications</p>
                  <ul className="space-y-2 text-sm text-white/70">
                    {(intake?.cert_suggestions ?? []).map((cert) => (
                      <li key={cert} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-green-400/60" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Button variant="gold">Request refresh</Button>
            </GlassCard>

            {/* Pivot Pathways Card */}
            {pivots.length ? (
              <GlassCard className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Pivot Pathways™</h3>
                  <Badge variant="gold">Pivot Pathways™</Badge>
                </div>
                
                <div className="grid gap-4">
                  {pivots.slice(0, 4).map((pivot, index) => (
                    <div
                      key={`${pivot.industry}-${index}`}
                      className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                    >
                      <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">{pivot.industry}</p>
                      <p className="mt-2 font-semibold text-white">
                        {pivot.role_titles.slice(0, 6).join(" · ")}
                      </p>
                      
                      <div className="mt-4 grid gap-5 md:grid-cols-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70 font-medium mb-2">Why you fit</p>
                          <ul className="space-y-1.5 text-xs text-white/70">
                            {pivot.why_you_fit.slice(0, 5).map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span className="flex-shrink-0 mt-1 h-1 w-1 rounded-full bg-green-400" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70 font-medium mb-2">Pivot narrative</p>
                          <ul className="space-y-1.5 text-xs text-white/70">
                            {pivot.pivot_narrative_bullets.slice(0, 5).map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span className="flex-shrink-0 mt-1 h-1 w-1 rounded-full bg-amber-300/40" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {pivot.recommended_certs.length ? (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70 font-medium mb-3">Cert stack</p>
                          <div className="flex flex-wrap gap-2">
                            {pivot.recommended_certs.slice(0, 4).map((cert) => (
                              <a
                                key={`${cert.name}-${cert.url}`}
                                href={cert.url}
                                target="_blank"
                                rel="noreferrer"
                                title={cert.why_it_matters}
                                className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] text-amber-200 hover:bg-amber-300/20 hover:border-amber-300/50 transition-colors duration-200"
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
              </GlassCard>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

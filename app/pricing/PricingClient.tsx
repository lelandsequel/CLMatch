"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import type { Tier } from "../../lib/pricing";
import { tierSortOrder } from "../../lib/pricing";

export default function PricingClient({
  quickWins,
  fullEngine,
  stripeDisabled,
  stripeReady
}: {
  quickWins: Tier[];
  fullEngine: Tier[];
  stripeDisabled: boolean;
  stripeReady: boolean;
}) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const allTiers = [...quickWins, ...fullEngine].sort(
    (a, b) => tierSortOrder.indexOf(a.id) - tierSortOrder.indexOf(b.id)
  );
  const comparisonRows = [
    { label: "Jobs included", value: (tier: Tier) => `${tier.limits.maxJobs}` },
    { label: "ATS resume rewrite", value: (tier: Tier) => (tier.flags.includeFullResumeRewrite ? "Yes" : "No") },
    { label: "Resume patch notes", value: (tier: Tier) => (tier.flags.includeResumePatchNotes ? "Yes" : "No") },
    { label: "Keyword map", value: (tier: Tier) => (tier.flags.includeKeywordMap ? "Yes" : "No") },
    { label: "Outreach kit", value: (tier: Tier) => (tier.flags.includeOutreachKit ? "Yes" : "No") },
    { label: "Follow-up cadence", value: (tier: Tier) => (tier.flags.includeCadence ? "Yes" : "No") },
    { label: "Cert plan + gaps", value: (tier: Tier) => (tier.flags.includeCertPlan ? "Yes" : "No") },
    {
      label: "Pivot Pathways™",
      value: (tier: Tier) => (tier.includesPivotPathways ? "✅" : "—")
    },
    { label: "Expanded sourcing", value: (tier: Tier) => (tier.flags.expandedSourcing ? "Yes" : "No") },
    { label: "Priority turnaround", value: (tier: Tier) => (tier.flags.priorityTurnaround ? "Yes" : "No") },
    { label: "Second revision", value: (tier: Tier) => (tier.flags.includesSecondRevision ? "Yes" : "No") },
    { label: "Executive QA", value: (tier: Tier) => (tier.requiresHumanQA ? "Included" : "No") },
    { label: "Delivery", value: (tier: Tier) => tier.delivery }
  ];

  const startCheckout = async (tierId: string) => {
    setLoadingTier(tierId);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId })
    });
    const data = (await response.json()) as { url?: string; error?: string };
    if (data.url) {
      window.location.assign(data.url);
    }
    setLoadingTier(null);
  };

  return (
    <section className="mt-16 space-y-16">
      {/* Status Messages */}
      {stripeDisabled ? (
        <div className="rounded-2xl border border-amber-300/30 backdrop-blur-sm bg-amber-300/10 p-5 text-sm text-amber-200">
          <span className="font-semibold">DEV MODE:</span> Stripe bypass enabled. Orders will be created as paid.
        </div>
      ) : null}

      {!stripeDisabled && !stripeReady ? (
        <div className="rounded-2xl border border-red-400/30 backdrop-blur-sm bg-red-400/10 p-5 text-sm text-red-300">
          <span className="font-semibold">Setup Required:</span> Stripe not configured. Set STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and all
          Price IDs before taking payments.
        </div>
      ) : null}

      {/* Quick Wins Section */}
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="gold">Quick wins</Badge>
          <p className="text-sm text-white/70 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">Fast, focused deliverables.</p>
          <div className="hidden md:flex flex-1 items-center gap-2 ml-4">
            <div className="h-px flex-1 bg-gradient-to-r from-amber-300/30 to-transparent" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {quickWins.map((tier, index) => (
            <div 
              key={tier.id} 
              className="group flex h-full flex-col p-6 rounded-xl backdrop-blur-sm bg-white/10 border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-1 mb-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-amber-200 transition-colors">
                  {tier.name}
                </h3>
                <p className="text-sm text-white/60">{tier.tagline}</p>
              </div>
              
              <div className="flex-1 space-y-5">
                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${tier.priceUSD}
                  </span>
                </div>
                
                {/* Turnaround */}
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">
                  Turnaround: {tier.delivery}
                </p>
                
                {/* Features */}
                <ul className="space-y-2.5 text-sm text-white/70">
                  {tier.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-300/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button
                variant="gold"
                className="mt-6 w-full"
                onClick={() => startCheckout(tier.id)}
                disabled={loadingTier === tier.id || (!stripeDisabled && !stripeReady)}
              >
                {loadingTier === tier.id ? "Redirecting..." : tier.ctaLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-3">
        <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-300/30" />
        <div className="h-2 w-2 rounded-full bg-amber-300/40" />
        <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-300/30" />
      </div>

      {/* Full Engine Section */}
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="gold">Full engine</Badge>
          <p className="text-sm text-white/70 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">Complete sourcing + ATS assets.</p>
          <div className="hidden md:flex flex-1 items-center gap-2 ml-4">
            <div className="h-px flex-1 bg-gradient-to-r from-amber-300/30 to-transparent" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {fullEngine.map((tier, index) => {
            const badge =
              tier.badge ??
              (tier.id === "rapid_offer_lite"
                ? "Most Popular"
                : tier.id === "offer_farming_report"
                  ? "Best Value"
                  : tier.id === "offer_sprint"
                    ? "White-glove"
                    : "");
            
            const isHighlighted = tier.id === "offer_farming_report" || tier.id === "offer_sprint";
            
            return (
              <div 
                key={tier.id} 
                className={`group flex h-full flex-col p-6 rounded-xl backdrop-blur-sm border transition-all animate-fade-in-up ${
                  isHighlighted 
                    ? 'bg-white/15 border-amber-300/40 ring-1 ring-amber-300/20' 
                    : 'bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/25'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-1 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-amber-200 transition-colors">
                      {tier.name}
                    </h3>
                    {badge ? (
                      <span className="flex-shrink-0 rounded-full bg-amber-300/20 border border-amber-300/30 px-3 py-1 text-[10px] uppercase tracking-wider text-amber-200 font-semibold">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-white/60">{tier.tagline}</p>
                </div>
                
                <div className="flex-1 space-y-5">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${tier.priceUSD}
                    </span>
                  </div>
                  
                  {/* Turnaround */}
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">
                    Turnaround: {tier.delivery}
                  </p>
                  
                  {/* Executive QA Badge */}
                  {tier.requiresHumanQA ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-300/20 border border-amber-300/30 px-4 py-1.5 text-[10px] uppercase tracking-wider text-amber-200 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
                      Executive QA Included
                    </div>
                  ) : null}
                  
                  {/* Features */}
                  <ul className="space-y-2.5 text-sm text-white/70">
                    {tier.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-300/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {tier.requiresHumanQA ? (
                    <p className="text-xs text-white/50 italic">
                      Human audit before delivery.
                    </p>
                  ) : null}
                </div>
                
                <Button
                  variant="gold"
                  className="mt-6 w-full"
                  onClick={() => startCheckout(tier.id)}
                  disabled={loadingTier === tier.id || (!stripeDisabled && !stripeReady)}
                >
                  {loadingTier === tier.id ? "Redirecting..." : tier.ctaLabel}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="p-6 rounded-xl backdrop-blur-sm bg-white/10 border border-white/15 overflow-hidden">
        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-semibold text-white">Feature comparison</h3>
          <p className="text-sm text-white/60">Premium positioning, transparent scope.</p>
        </div>
        
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">
                  Feature
                </th>
                {allTiers.map((tier) => (
                  <th key={tier.id} className="py-4 pr-6 text-left">
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">
                      {tier.name}
                    </span>
                    <span className="block mt-1 text-xs text-white/50">
                      ${tier.priceUSD}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr 
                  key={row.label} 
                  className="border-b border-white/10 hover:bg-white/5 transition-colors duration-150"
                >
                  <td className="py-4 pr-6 font-medium text-white text-sm">
                    {row.label}
                  </td>
                  {allTiers.map((tier) => {
                    const value = row.value(tier);
                    const isPositive = value === "Yes" || value === "Included" || value === "✅";
                    const isNegative = value === "No" || value === "—";
                    
                    return (
                      <td 
                        key={tier.id} 
                        className={`py-4 pr-6 text-sm ${
                          isPositive 
                            ? 'text-green-400 font-medium' 
                            : isNegative 
                              ? 'text-white/30' 
                              : 'text-white/70'
                        }`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Executive QA Section */}
      <div className="p-8 rounded-xl backdrop-blur-sm bg-white/10 border border-amber-300/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400" />
        
        <div className="relative">
          <Badge variant="gold" className="mb-4">Premium</Badge>
          <h3 className="text-xl font-semibold text-white mb-3">AI-powered. Executive audited.</h3>
          <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
            Every deliverable is generated by our sourcing and scoring engine (Fit + Ghost scoring).
            For premium tiers, a seasoned executive with 15+ years of experience audits your outputs
            to ensure accuracy, relevance, and professionalism before delivery.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="p-6 rounded-xl backdrop-blur-sm bg-white/10 border border-white/15">
        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-semibold text-white">FAQ</h3>
          <p className="text-sm text-white/60">Short answers for busy buyers.</p>
        </div>
        
        <div className="space-y-6 text-sm">
          {[
            {
              q: "Do you apply for me?",
              a: "No - we hand you the highest-signal roles and a conversion-ready kit."
            },
            {
              q: "How do you avoid ghost jobs?",
              a: "We score freshness, ATS signals, and hiring intent, and we exclude low-signal listings."
            },
            {
              q: "Is this fully automated?",
              a: "Our engine generates the deliverables automatically. For premium tiers, a senior executive reviews all outputs before release."
            },
            {
              q: "What does the executive audit include?",
              a: "Verification of job quality (anti-ghost), ATS alignment, resume truthfulness, and outreach tone."
            },
            {
              q: "Refunds?",
              a: "If we cannot source real roles that match your constraints, we refund."
            }
          ].map((item) => (
            <div 
              key={item.q} 
              className="group pb-6 border-b border-white/10 last:border-0 last:pb-0"
            >
              <p className="font-semibold text-white group-hover:text-amber-200 transition-colors duration-200">
                {item.q}
              </p>
              <p className="mt-2 text-white/70 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

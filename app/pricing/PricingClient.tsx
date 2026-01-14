"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardPremium, CardHighlight } from "../../components/ui/card";
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
      label: "Pivot Pathways™ (transferable skills + alternative industries + pivot narrative)",
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
        <div className="rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 to-amber/5 p-5 text-sm text-gold-dark dark:text-gold backdrop-blur-sm">
          <span className="font-semibold">DEV MODE:</span> Stripe bypass enabled. Orders will be created as paid.
        </div>
      ) : null}

      {!stripeDisabled && !stripeReady ? (
        <div className="rounded-2xl border border-terracotta/30 bg-gradient-to-r from-terracotta/10 to-terracotta/5 p-5 text-sm text-terracotta backdrop-blur-sm">
          <span className="font-semibold">Setup Required:</span> Stripe not configured. Set STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and all
          Price IDs before taking payments.
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════════════════════════════
          Quick Wins Section
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="default">Quick wins</Badge>
          <p className="text-sm text-ink-soft/70 dark:text-parchment-dark/60">Fast, focused deliverables.</p>
          {/* Decorative line */}
          <div className="hidden md:flex flex-1 items-center gap-2 ml-4">
            <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {quickWins.map((tier, index) => (
            <Card 
              key={tier.id} 
              className="group flex h-full flex-col animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <CardTitle className="group-hover:text-gold-dark dark:group-hover:text-gold transition-colors duration-200">
                  {tier.name}
                </CardTitle>
                <CardDescription>{tier.tagline}</CardDescription>
              </CardHeader>
              
              <div className="flex-1 space-y-5">
                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold bg-gradient-to-br from-ink to-ink-soft bg-clip-text text-transparent dark:from-cream dark:to-gold-muted">
                    ${tier.priceUSD}
                  </span>
                </div>
                
                {/* Turnaround */}
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">
                  Turnaround: {tier.delivery}
                </p>
                
                {/* Features */}
                <ul className="space-y-2.5 text-sm text-ink-soft/80 dark:text-parchment-dark/70">
                  {tier.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-gold/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button
                className="mt-6 w-full"
                onClick={() => startCheckout(tier.id)}
                disabled={loadingTier === tier.id || (!stripeDisabled && !stripeReady)}
              >
                {loadingTier === tier.id ? "Redirecting..." : tier.ctaLabel}
              </Button>
              
              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-gold to-gold-light group-hover:w-full transition-all duration-500" />
            </Card>
          ))}
        </div>
      </div>

      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-3">
        <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold/30" />
        <div className="h-2 w-2 rounded-full bg-gold/40" />
        <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold/30" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Full Engine Section
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="premium">Full engine</Badge>
          <p className="text-sm text-ink-soft/70 dark:text-parchment-dark/60">Complete sourcing + ATS assets.</p>
          {/* Decorative line */}
          <div className="hidden md:flex flex-1 items-center gap-2 ml-4">
            <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
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
            const CardComponent = isHighlighted ? CardPremium : Card;
            
            return (
              <CardComponent 
                key={tier.id} 
                className={`group flex h-full flex-col animate-fade-in-up ${isHighlighted ? 'ring-1 ring-gold/30' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="group-hover:text-gold-dark dark:group-hover:text-gold transition-colors duration-200">
                      {tier.name}
                    </CardTitle>
                    {badge ? (
                      <span className="flex-shrink-0 rounded-full bg-gradient-to-r from-ink to-ink-soft px-3 py-1 text-[10px] uppercase tracking-wider text-gold-light font-semibold shadow-button">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                  <CardDescription>{tier.tagline}</CardDescription>
                </CardHeader>
                
                <div className="flex-1 space-y-5">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold bg-gradient-to-br from-ink to-ink-soft bg-clip-text text-transparent dark:from-cream dark:to-gold-muted">
                      ${tier.priceUSD}
                    </span>
                  </div>
                  
                  {/* Turnaround */}
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">
                    Turnaround: {tier.delivery}
                  </p>
                  
                  {/* Executive QA Badge */}
                  {tier.requiresHumanQA ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ink to-ink-soft px-4 py-1.5 text-[10px] uppercase tracking-wider text-gold-light font-semibold shadow-button">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                      Executive QA Included
                    </div>
                  ) : null}
                  
                  {/* Features */}
                  <ul className="space-y-2.5 text-sm text-ink-soft/80 dark:text-parchment-dark/70">
                    {tier.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-gold/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {tier.requiresHumanQA ? (
                    <p className="text-xs text-ink-soft/60 dark:text-parchment-dark/50 italic">
                      Human audit before delivery.
                    </p>
                  ) : null}
                </div>
                
                <Button
                  variant={isHighlighted ? "gold" : "primary"}
                  className="mt-6 w-full"
                  onClick={() => startCheckout(tier.id)}
                  disabled={loadingTier === tier.id || (!stripeDisabled && !stripeReady)}
                >
                  {loadingTier === tier.id ? "Redirecting..." : tier.ctaLabel}
                </Button>
                
                {/* Hover accent line */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-gold to-gold-light group-hover:w-full transition-all duration-500" />
              </CardComponent>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Feature Comparison Table
          ═══════════════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Feature comparison</CardTitle>
          <CardDescription>Premium positioning, transparent scope.</CardDescription>
        </CardHeader>
        
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20">
                <th className="py-4 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
                  Feature
                </th>
                {allTiers.map((tier) => (
                  <th key={tier.id} className="py-4 pr-6 text-left">
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
                      {tier.name}
                    </span>
                    <span className="block mt-1 text-xs text-ink-soft/60 dark:text-parchment-dark/50">
                      ${tier.priceUSD}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, rowIndex) => (
                <tr 
                  key={row.label} 
                  className="border-b border-gold/10 hover:bg-gold/[0.02] transition-colors duration-150"
                >
                  <td className="py-4 pr-6 font-medium text-ink dark:text-cream text-sm">
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
                            ? 'text-sage font-medium' 
                            : isNegative 
                              ? 'text-ink-soft/40 dark:text-parchment-dark/30' 
                              : 'text-ink-soft dark:text-parchment-dark'
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
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          Executive QA Section
          ═══════════════════════════════════════════════════════════════════ */}
      <CardPremium className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-radial from-gold/10 to-transparent rounded-full blur-2xl" />
        
        <div className="relative">
          <CardHeader>
            <Badge variant="premium" className="w-fit mb-2">Premium</Badge>
            <CardTitle>AI-powered. Executive audited.</CardTitle>
          </CardHeader>
          <p className="text-sm text-ink-soft/80 dark:text-parchment-dark/70 leading-relaxed max-w-3xl">
            Every deliverable is generated by our sourcing and scoring engine (Fit + Ghost scoring).
            For premium tiers, a seasoned executive with 15+ years of experience audits your outputs
            to ensure accuracy, relevance, and professionalism before delivery.
          </p>
        </div>
      </CardPremium>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ Section
          ═══════════════════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <CardDescription>Short answers for busy buyers.</CardDescription>
        </CardHeader>
        
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
          ].map((item, index) => (
            <div 
              key={item.q} 
              className="group pb-6 border-b border-gold/10 last:border-0 last:pb-0"
            >
              <p className="font-semibold text-ink dark:text-cream group-hover:text-gold-dark dark:group-hover:text-gold transition-colors duration-200">
                {item.q}
              </p>
              <p className="mt-2 text-ink-soft/80 dark:text-parchment-dark/70 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

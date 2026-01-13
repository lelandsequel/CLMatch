"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import type { Tier } from "../../lib/pricing";

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
    <section className="mt-12 space-y-12">
      {stripeDisabled ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          DEV MODE: Stripe bypass enabled. Orders will be created as paid.
        </div>
      ) : null}

      {!stripeDisabled && !stripeReady ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Stripe not configured. Set STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and all
          Price IDs before taking payments.
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge>Quick wins</Badge>
          <p className="text-sm text-slate-500">Fast, focused deliverables.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quickWins.map((tier) => (
            <Card key={tier.id} className="flex h-full flex-col">
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.tagline}</CardDescription>
              </CardHeader>
              <div className="flex-1 space-y-4">
                <p className="text-3xl font-semibold text-ink dark:text-white">${tier.priceUSD}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Turnaround: {tier.delivery}
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {tier.bullets.map((item) => (
                    <li key={item}>• {item}</li>
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
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge>Full engine</Badge>
          <p className="text-sm text-slate-500">Complete sourcing + ATS assets.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {fullEngine.map((tier) => {
            const badge =
              tier.id === "rapid_offer_lite"
                ? "Most Popular"
                : tier.id === "offer_farming_report"
                  ? "Best Value"
                  : tier.id === "offer_sprint"
                    ? "White-glove"
                    : "";
            return (
              <Card key={tier.id} className="flex h-full flex-col border-ink/10">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{tier.name}</CardTitle>
                    {badge ? (
                      <span className="rounded-full bg-ink px-3 py-1 text-xs uppercase tracking-widest text-white">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                  <CardDescription>{tier.tagline}</CardDescription>
                </CardHeader>
                <div className="flex-1 space-y-4">
                  <p className="text-3xl font-semibold text-ink dark:text-white">${tier.priceUSD}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Turnaround: {tier.delivery}
                  </p>
                  {tier.requiresHumanQA ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-widest text-white">
                      Executive QA Included
                    </div>
                  ) : null}
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {tier.bullets.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  {tier.requiresHumanQA ? (
                    <p className="text-xs text-slate-500">Human audit before delivery.</p>
                  ) : null}
                </div>
                <Button
                  className="mt-6 w-full"
                  onClick={() => startCheckout(tier.id)}
                  disabled={loadingTier === tier.id || (!stripeDisabled && !stripeReady)}
                >
                  {loadingTier === tier.id ? "Redirecting..." : tier.ctaLabel}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature comparison</CardTitle>
          <CardDescription>Premium positioning, transparent scope.</CardDescription>
        </CardHeader>
        <div className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
          <div className="space-y-2">
            <p>• ATS resume rewrite</p>
            <p>• Job sourcing + anti-ghost scoring</p>
            <p>• Outreach scripts + cadence</p>
          </div>
          <div className="space-y-2">
            <p>• Seniority-aligned positioning</p>
            <p>• Cert plan + skill gaps</p>
            <p>• Human QA + approval flow</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI-powered. Executive audited.</CardTitle>
        </CardHeader>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Every deliverable is generated by our sourcing and scoring engine (Fit + Ghost scoring).
          For premium tiers, a seasoned executive with 15+ years of experience audits your outputs
          to ensure accuracy, relevance, and professionalism before delivery.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <CardDescription>Short answers for busy buyers.</CardDescription>
        </CardHeader>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <p className="font-semibold text-ink dark:text-white">Do you apply for me?</p>
            <p>No - we hand you the highest-signal roles and a conversion-ready kit.</p>
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-white">How do you avoid ghost jobs?</p>
            <p>We score freshness, ATS signals, and hiring intent, and we exclude low-signal listings.</p>
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-white">Is this fully automated?</p>
            <p>
              Our engine generates the deliverables automatically. For premium tiers, a senior
              executive reviews all outputs before release.
            </p>
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-white">
              What does the executive audit include?
            </p>
            <p>
              Verification of job quality (anti-ghost), ATS alignment, resume truthfulness, and
              outreach tone.
            </p>
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-white">Refunds?</p>
            <p>If we cannot source real roles that match your constraints, we refund.</p>
          </div>
        </div>
      </Card>
    </section>
  );
}

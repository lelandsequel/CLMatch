import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { Section } from "../components/section";
import { PageHeader } from "../components/page-header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function HomePage() {
  return (
    <AppShell>
      <Section className="py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Badge>Premium Offer Farming</Badge>
            <h1 className="text-[46px] font-semibold leading-tight md:text-[56px]">
              Get interviews faster with real jobs, ATS‑ready assets, and a plan built to win.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              C&amp;L Job Match is the premium report for executives, operators, and specialists
              who want precision sourcing, anti‑ghost scoring, and outreach that converts.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/pricing">
                <Button>View pricing</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">See dashboard</Button>
              </Link>
            </div>
          </div>
          <Card className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">What you get</p>
              <h2 className="text-2xl font-semibold">Offer Farming Report</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>• ATS resume rewrite (PDF + DOCX)</li>
              <li>• 10 urgent roles with Fit + Ghost scores</li>
              <li>• Skill gaps + certification plan</li>
              <li>• Outreach scripts + 14‑day cadence</li>
              <li>• Clickable, premium PDF + dashboard</li>
            </ul>
            <div className="rounded-xl border border-mist bg-gradient-to-r from-white to-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="font-semibold text-ink dark:text-white">We do the work. You get interviews.</p>
              <p className="text-slate-500">Delivery in 3–5 business days.</p>
            </div>
          </Card>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Who it’s for",
              detail: "Executives, operators, ICs who want an elite job pipeline fast."
            },
            {
              title: "Anti‑ghost scoring",
              detail: "We score roles for freshness, clarity, and hiring signals to avoid dead posts."
            },
            {
              title: "Human QA",
              detail: "Every report is reviewed before delivery. No bot‑only output."
            }
          ].map((item) => (
            <Card key={item.title}>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <Card className="grid gap-6 md:grid-cols-[0.4fr_0.6fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Real jobs. Real signal.</p>
            <h2 className="mt-3 text-2xl font-semibold">No aggregator junk. No ghost roles.</h2>
          </div>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>• ATS-verified postings</li>
            <li>• Anti-ghost scoring</li>
            <li>• Premium tiers include executive audit</li>
          </ul>
        </Card>
      </Section>

      <Section className="py-12 md:py-16">
        <PageHeader title="Sample report preview" subtitle="A glimpse of what your dashboard and PDF will look like." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {["Candidate snapshot", "Top 10 jobs", "Skills + certs", "Outreach pack"].map((item) => (
            <Card key={item} className="h-full">
              <h3 className="text-lg font-semibold">{item}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Crisp, actionable, and engineered for quick execution.
              </p>
              <div className="mt-4 h-28 rounded-xl border border-dashed border-mist bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60" />
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <PageHeader title="FAQ" subtitle="Clear answers for busy leaders." />
        <div className="mt-8 grid gap-4">
          {[
            {
              q: "Turnaround time?",
              a: "Rapid reports deliver in 3–5 business days. Sprint is priority."
            },
            { q: "Privacy?", a: "Private, encrypted storage. We never sell your data." },
            { q: "Refunds?", a: "If we miss delivery or fail to meet scope, we fix it fast." }
          ].map((item) => (
            <Card key={item.q}>
              <h4 className="text-lg font-semibold">{item.q}</h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
            </Card>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}

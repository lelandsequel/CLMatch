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
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Badge>C&amp;L Job Match</Badge>
            <h1 className="text-[46px] font-semibold leading-tight md:text-[56px]">
              Stop wasting hours on ghost jobs.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              C&amp;L Job Match finds real urgent roles, scores fit + ghost risk, and delivers an
              ATS-ready interview kit.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/pricing">
                <Button>View pricing</Button>
              </Link>
              <Link href="#sample">
                <Button variant="secondary">See sample output</Button>
              </Link>
            </div>
            <div className="rounded-xl border border-mist bg-white px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              ATS-verified roles / Anti-ghost scoring / Premium tiers include Executive QA
            </div>
          </div>
          <Card className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Offer Farming Report</p>
              <h2 className="text-2xl font-semibold">A premium sourcing engine</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>- ATS resume rewrite (PDF + DOCX)</li>
              <li>- 10 urgent roles with Fit + Ghost scores</li>
              <li>- Skill gaps + certification plan</li>
              <li>- Outreach scripts + 14-day cadence</li>
              <li>- Clickable, premium PDF + dashboard</li>
            </ul>
            <div className="rounded-xl border border-mist bg-gradient-to-r from-white to-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="font-semibold text-ink dark:text-white">We do the work. You get interviews.</p>
              <p className="text-slate-500">Delivery in 3-5 business days.</p>
            </div>
          </Card>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <PageHeader title="How it works" subtitle="Fast, focused, and built for people who value time." />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Intake",
              detail: "Tell us your role targets, constraints, and upload your resume."
            },
            {
              title: "Engine",
              detail: "We source ATS roles, score fit + ghost risk, and craft your kit."
            },
            {
              title: "Delivery",
              detail: "Receive a premium report, ATS-ready resume, and outreach plan."
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
        <PageHeader title="What you get" subtitle="Everything you need to execute fast." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Urgent job shortlist",
              detail: "Clickable, ATS-verified roles with Fit + Ghost scoring."
            },
            {
              title: "ATS resume rewrite",
              detail: "Clean, compliant formatting delivered in PDF + DOCX."
            },
            {
              title: "Outreach kit + cadence",
              detail: "Recruiter + hiring manager scripts with follow-up timing."
            },
            {
              title: "Cert plan + skill gaps",
              detail: "Quick wins and deeper certs mapped to your target roles."
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
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Why we&apos;re different</p>
            <h2 className="mt-3 text-2xl font-semibold">No aggregator junk. No low-signal listings.</h2>
          </div>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>- ATS-verified sourcing only</li>
            <li>- Verification checks + confidence scoring</li>
            <li>- Human audit on premium tiers</li>
          </ul>
        </Card>
      </Section>

      <Section className="py-12 md:py-16">
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Executive QA</p>
          <h2 className="text-2xl font-semibold">AI-powered. Executive audited.</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Every deliverable is generated by our sourcing and scoring engine (Fit + Ghost scoring).
            For premium tiers, a seasoned executive with 15+ years of experience audits outputs to
            ensure accuracy, relevance, and professionalism before delivery.
          </p>
        </Card>
      </Section>

      <Section id="sample" className="py-12 md:py-16">
        <PageHeader title="Sample output" subtitle="A preview of the premium report experience." />
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
              a: "Delivery ranges from same-day to 3-5 business days, depending on tier."
            },
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
              a: "Our engine generates the deliverables automatically. Premium tiers include executive QA."
            },
            {
              q: "Refunds?",
              a: "If we cannot source real roles that match your constraints, we refund."
            },
            {
              q: "Privacy?",
              a: "Private, encrypted storage. We never sell your data."
            }
          ].map((item) => (
            <Card key={item.q}>
              <h4 className="text-lg font-semibold">{item.q}</h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p>Support: support@cljobmatch.com</p>
          <div className="flex items-center gap-4">
            <a href="#" className="underline">
              Terms
            </a>
            <a href="#" className="underline">
              Privacy
            </a>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}

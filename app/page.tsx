import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { Section } from "../components/section";
import { PageHeader } from "../components/page-header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { sampleReport } from "../lib/sampleReport";

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
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Candidate snapshot</h3>
              <Badge className="text-[10px]">Sample</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-ink dark:text-white">{sampleReport.candidate.name}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {sampleReport.candidate.headline}
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{sampleReport.candidate.summary}</p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {sampleReport.candidate.bullets.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {sampleReport.candidate.skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-mist px-3 py-1">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tools</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {sampleReport.candidate.tools.map((tool) => (
                    <span key={tool} className="rounded-full border border-mist px-3 py-1">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Target roles</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {sampleReport.candidate.targetRoles.join(", ")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Location</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {sampleReport.candidate.locationPreference}
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Skills + certs</h3>
              <Badge className="text-[10px]">Sample</Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gap skills</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {sampleReport.gaps.skills.map((skill) => (
                  <li key={skill}>- {skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recommended certs</p>
              <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {sampleReport.gaps.certs.map((cert) => (
                  <div key={cert.name} className="rounded-xl border border-mist p-3">
                    <p className="font-semibold text-ink dark:text-white">{cert.name}</p>
                    <p className="text-xs text-slate-500">{cert.provider}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <a href={cert.link} target="_blank" rel="noreferrer" className="underline">
                        View cert
                      </a>
                      <span>{cert.studyDays}-day plan</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Suggested study plan: {sampleReport.gaps.studyPlanDays} days total.
              </p>
            </div>
          </Card>

          <Card className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pivot Pathways</h3>
              <Badge className="text-[10px]">Sample</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {sampleReport.pivotPathways.pivots.map((pivot) => (
                <div key={pivot.industry} className="rounded-xl border border-mist p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{pivot.industry}</p>
                  <p className="mt-2 text-sm font-semibold text-ink dark:text-white">
                    {pivot.role_titles.join(", ")}
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {pivot.why_you_fit.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                  <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {pivot.pivot_narrative_bullets.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    {pivot.recommended_certs.map((cert) => (
                      <a
                        key={cert.name}
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-mist px-3 py-1"
                      >
                        {cert.name}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Top 10 jobs</h3>
              <Badge className="text-[10px]">Sample</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-mist text-left text-xs uppercase tracking-widest text-slate-400">
                    <th className="py-3">Role</th>
                    <th>Company</th>
                    <th>Fit</th>
                    <th>Ghost</th>
                    <th>Source</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sampleReport.jobs.map((job) => (
                    <tr key={`${job.company}-${job.role}`} className="border-b border-mist/60">
                      <td className="py-3 font-medium text-ink dark:text-white">{job.role}</td>
                      <td className="text-slate-600 dark:text-slate-300">{job.company}</td>
                      <td>{job.fitScore}</td>
                      <td>{job.ghostScore}</td>
                      <td>{job.source}</td>
                      <td>
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-mist px-3 py-1 text-xs"
                        >
                          Apply
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Outreach pack</h3>
              <Badge className="text-[10px]">Sample</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hiring manager email</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-mist bg-white p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                  {sampleReport.outreach.hiringManagerEmail}
                </pre>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recruiter email</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-mist bg-white p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                  {sampleReport.outreach.recruiterEmail}
                </pre>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">LinkedIn note</p>
                <div className="mt-2 rounded-xl border border-mist bg-white p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                  {sampleReport.outreach.linkedinNote}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">14-day cadence</p>
                <ul className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {sampleReport.outreach.cadence.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <PageHeader title="FAQ" subtitle="Clear answers for busy leaders." />
        <div className="mt-8 grid gap-4">
          {[
            {
              q: "What exactly do I receive?",
              a: "You receive a premium job-winning package: a clean ATS-optimized resume rewrite (PDF + DOCX), a Top 10 shortlist of urgent roles (with Fit + Ghost scoring + direct apply links), a skill/cert upgrade plan, and an outreach kit with scripts + cadence."
            },
            {
              q: "Are these real jobs or scraped listings?",
              a: "Real roles only. We source directly from ATS platforms (Greenhouse, Lever, Ashby, Workday). No job-board spam, no random aggregators."
            },
            {
              q: "What does “Ghost Score” mean?",
              a: "Ghost Score estimates the likelihood a posting is stale, unclear, or not actively hiring. Lower score = healthier signal. It helps you avoid time-wasting dead-end applications."
            },
            {
              q: "Do you apply to jobs for me?",
              a: "Not yet. Today we deliver the highest-quality shortlist and outreach kit so you can execute quickly. Premium tiers include Executive QA so you’re applying with assets that win."
            },
            {
              q: "Can you target a specific role or job URL?",
              a: "Yes. You can submit a target title, company, and/or job URL. We’ll calibrate your resume and shortlist around that target and adjacent roles you can realistically win."
            },
            {
              q: "Do you support contract roles?",
              a: "Yes. Toggle “Contract OK” during intake. We’ll include contract-to-hire and urgent contract roles when appropriate."
            },
            {
              q: "How fast is delivery?",
              a: "Most reports deliver in 3–5 business days. Higher tiers can include priority turnaround."
            },
            {
              q: "Do you offer refunds?",
              a: "We don’t offer refunds. However — we do guarantee delivery. If we don’t source real roles that match your constraints (remote-only, seniority, salary floor, titles, etc.), we will re-run the sourcing and scoring pipeline until we do."
            },
            {
              q: "Is AI generating everything?",
              a: "AI accelerates the work. We still operate with quality gates. Premium tiers include Executive QA by seasoned operators (15+ years) to ensure accuracy, clarity, and professionalism before delivery."
            },
            {
              q: "What industries do you support?",
              a: "We specialize in high-signal roles in tech, SaaS, ops, product, finance, and business leadership. If you’re an operator, specialist, or exec — this is built for you."
            }
          ].map((item) => (
            <Card key={item.q} className="border border-mist/70">
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

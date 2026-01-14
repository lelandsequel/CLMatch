import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { Section } from "../components/section";
import { PageHeader, PageHeaderCentered } from "../components/page-header";
import { Button } from "../components/ui/button";
import { Card, CardPremium } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { sampleReport } from "../lib/sampleReport";

export default function HomePage() {
  return (
    <AppShell>
      {/* ═══════════════════════════════════════════════════════════════════
          Hero Section - Dramatic Rembrandt lighting with Ghibli warmth
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="relative py-20 md:py-32 overflow-hidden">
        {/* Decorative light beam */}
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-gradient-radial from-gold/10 via-gold/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-amber/8 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-8 animate-fade-in-up">
            <Badge variant="gold" className="animate-pulse-glow">C&amp;L Job Match</Badge>
            
            <h1 className="text-[42px] font-bold leading-[1.08] tracking-tight md:text-[58px] lg:text-[64px]">
              <span className="bg-gradient-to-br from-ink via-ink-soft to-ink-light bg-clip-text text-transparent dark:from-cream dark:via-parchment dark:to-gold-muted">
                Stop wasting hours
              </span>
              <br />
              <span className="bg-gradient-to-r from-gold via-gold-light to-amber bg-clip-text text-transparent">
                on ghost jobs.
              </span>
            </h1>
            
            <p className="text-lg text-ink-soft/90 dark:text-parchment-dark/80 max-w-xl leading-relaxed">
              C&amp;L Job Match finds real urgent roles, scores fit + ghost risk, and delivers an
              ATS-ready interview kit.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/pricing">
                <Button variant="gold" className="text-base px-7 py-3">View pricing</Button>
              </Link>
              <Link href="#sample">
                <Button variant="secondary" className="text-base px-7 py-3">See sample output</Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="relative rounded-2xl border border-gold/20 bg-gradient-to-r from-cream/80 to-parchment/60 px-5 py-4 backdrop-blur-sm dark:from-navy/60 dark:to-navy-deep/40 dark:border-gold/10">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/5 to-transparent" />
              <p className="relative text-xs uppercase tracking-[0.25em] text-ink-soft/70 dark:text-parchment-dark/60 font-medium">
                ATS-verified roles · Anti-ghost scoring · Premium tiers include Executive QA
              </p>
            </div>
          </div>
          
          {/* Hero Card */}
          <CardPremium className="space-y-6 animate-fade-in-up delay-200">
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">Offer Farming Report</p>
              <h2 className="mt-2 text-2xl font-bold text-ink dark:text-cream tracking-tight">A premium sourcing engine</h2>
              {/* Decorative line */}
              <div className="mt-3 flex items-center gap-2">
                <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
                <div className="h-0.5 w-2 rounded-full bg-gold/40" />
              </div>
            </div>
            
            <ul className="space-y-3.5 text-sm text-ink-soft dark:text-parchment-dark">
              {[
                "ATS resume rewrite (PDF + DOCX)",
                "10 urgent roles with Fit + Ghost scores",
                "Skill gaps + certification plan",
                "Outreach scripts + 14-day cadence",
                "Clickable, premium PDF + dashboard"
              ].map((item, i) => (
                <li key={item} className="flex items-start gap-3 group">
                  <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-gold group-hover:shadow-glow transition-shadow duration-300" />
                  <span className="group-hover:text-ink dark:group-hover:text-cream transition-colors duration-200">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="relative rounded-xl border border-gold/20 bg-gradient-to-r from-parchment-warm/80 to-cream/60 p-4 dark:from-navy/80 dark:to-navy-deep/60 dark:border-gold/10">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/5 to-transparent" />
              <p className="relative font-semibold text-ink dark:text-cream">We do the work. You get interviews.</p>
              <p className="relative mt-1 text-sm text-ink-soft/70 dark:text-parchment-dark/60">Delivery in 3-5 business days.</p>
            </div>
          </CardPremium>
        </div>
      </Section>

      {/* Decorative divider */}
      <div className="container">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          How It Works Section
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="relative py-16 md:py-24">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-radial from-gold/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <PageHeaderCentered 
          title="How it works" 
          subtitle="Fast, focused, and built for people who value time."
        />
        
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Intake",
              detail: "Tell us your role targets, constraints, and upload your resume."
            },
            {
              step: "02",
              title: "Engine",
              detail: "We source ATS roles, score fit + ghost risk, and craft your kit."
            },
            {
              step: "03",
              title: "Delivery",
              detail: "Receive a premium report, ATS-ready resume, and outreach plan."
            }
          ].map((item, index) => (
            <Card 
              key={item.title} 
              className="group relative overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Step number watermark */}
              <span className="absolute -top-4 -right-2 text-[80px] font-bold text-gold/[0.07] dark:text-gold/[0.05] select-none">
                {item.step}
              </span>
              
              <div className="relative">
                <span className="text-xs font-semibold text-gold tracking-wider">{item.step}</span>
                <h3 className="mt-2 text-xl font-semibold text-ink dark:text-cream">{item.title}</h3>
                <p className="mt-3 text-sm text-ink-soft/80 dark:text-parchment-dark/70 leading-relaxed">{item.detail}</p>
              </div>
              
              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-gold to-gold-light group-hover:w-full transition-all duration-500" />
            </Card>
          ))}
        </div>
      </Section>

      {/* Decorative brush stroke divider */}
      <div className="container py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/30" />
          <div className="h-2 w-2 rounded-full bg-gold/40" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/30" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          What You Get Section
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="py-16 md:py-24">
        <PageHeaderCentered 
          title="What you get" 
          subtitle="Everything you need to execute fast."
        />
        
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            {
              icon: "🎯",
              title: "Urgent job shortlist",
              detail: "Clickable, ATS-verified roles with Fit + Ghost scoring."
            },
            {
              icon: "📄",
              title: "ATS resume rewrite",
              detail: "Clean, compliant formatting delivered in PDF + DOCX."
            },
            {
              icon: "✉️",
              title: "Outreach kit + cadence",
              detail: "Recruiter + hiring manager scripts with follow-up timing."
            },
            {
              icon: "📈",
              title: "Cert plan + skill gaps",
              detail: "Quick wins and deeper certs mapped to your target roles."
            }
          ].map((item, index) => (
            <Card 
              key={item.title}
              className="group flex gap-4 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-amber/10 text-2xl group-hover:shadow-glow transition-shadow duration-300">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-soft/80 dark:text-parchment-dark/70 leading-relaxed">{item.detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          Why Different Section
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="py-16 md:py-24">
        <CardPremium className="relative overflow-hidden">
          {/* Background light effect */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-radial from-gold/10 to-transparent rounded-full blur-2xl" />
          
          <div className="relative grid gap-8 md:grid-cols-[0.4fr_0.6fr]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">Why we&apos;re different</p>
              <h2 className="mt-3 text-2xl font-bold text-ink dark:text-cream tracking-tight">
                No aggregator junk. No low-signal listings.
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-gold to-gold-light" />
                <div className="h-0.5 w-2 rounded-full bg-gold/40" />
              </div>
            </div>
            
            <ul className="space-y-4 text-sm text-ink-soft dark:text-parchment-dark">
              {[
                "ATS-verified sourcing only",
                "Verification checks + confidence scoring",
                "Human audit on premium tiers"
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 group">
                  <span className="flex-shrink-0 h-2 w-2 rounded-full bg-gradient-to-br from-gold to-gold-dark group-hover:shadow-glow transition-shadow duration-300" />
                  <span className="group-hover:text-ink dark:group-hover:text-cream transition-colors duration-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardPremium>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          Executive QA Section
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="py-16 md:py-24">
        <Card className="relative overflow-hidden">
          {/* Subtle corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold/10 to-transparent" />
          
          <div className="relative space-y-4">
            <Badge variant="premium">Executive QA</Badge>
            <h2 className="text-2xl font-bold text-ink dark:text-cream tracking-tight">AI-powered. Executive audited.</h2>
            <p className="text-sm text-ink-soft/80 dark:text-parchment-dark/70 leading-relaxed max-w-3xl">
              Every deliverable is generated by our sourcing and scoring engine (Fit + Ghost scoring).
              For premium tiers, a seasoned executive with 15+ years of experience audits outputs to
              ensure accuracy, relevance, and professionalism before delivery.
            </p>
          </div>
        </Card>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          Sample Output Section
          ═══════════════════════════════════════════════════════════════════ */}
      <Section id="sample" className="relative py-16 md:py-24">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
        
        <PageHeaderCentered 
          title="Sample output" 
          subtitle="A preview of the premium report experience."
        />
        
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Candidate Snapshot Card */}
          <Card className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-cream">Candidate snapshot</h3>
              <Badge variant="gold" className="text-[10px]">Sample</Badge>
            </div>
            
            <div className="space-y-1.5 pb-4 border-b border-gold/10">
              <p className="font-semibold text-ink dark:text-cream">{sampleReport.candidate.name}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                {sampleReport.candidate.headline}
              </p>
            </div>
            
            <p className="text-sm text-ink-soft/80 dark:text-parchment-dark/70 leading-relaxed">{sampleReport.candidate.summary}</p>
            
            <ul className="space-y-2.5 text-sm text-ink-soft dark:text-parchment-dark">
              {sampleReport.candidate.bullets.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-gold/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="grid gap-5 md:grid-cols-2 pt-4 border-t border-gold/10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Skills</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {sampleReport.candidate.skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-ink-soft dark:text-parchment-dark hover:border-gold/40 hover:bg-gold/10 transition-colors duration-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Tools</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {sampleReport.candidate.tools.map((tool) => (
                    <span key={tool} className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-ink-soft dark:text-parchment-dark hover:border-gold/40 hover:bg-gold/10 transition-colors duration-200">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid gap-5 md:grid-cols-2 pt-4 border-t border-gold/10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Target roles</p>
                <p className="mt-2 text-sm text-ink-soft dark:text-parchment-dark">
                  {sampleReport.candidate.targetRoles.join(", ")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Location</p>
                <p className="mt-2 text-sm text-ink-soft dark:text-parchment-dark">
                  {sampleReport.candidate.locationPreference}
                </p>
              </div>
            </div>
          </Card>

          {/* Skills + Certs Card */}
          <Card className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-cream">Skills + certs</h3>
              <Badge variant="gold" className="text-[10px]">Sample</Badge>
            </div>
            
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Gap skills</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft dark:text-parchment-dark">
                {sampleReport.gaps.skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-amber/60" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 border-t border-gold/10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Recommended certs</p>
              <div className="mt-4 space-y-3">
                {sampleReport.gaps.certs.map((cert) => (
                  <div key={cert.name} className="rounded-xl border border-gold/20 bg-gradient-to-r from-cream/50 to-parchment/30 p-4 hover:border-gold/40 hover:shadow-soft transition-all duration-200 dark:from-navy/50 dark:to-navy-deep/30">
                    <p className="font-semibold text-ink dark:text-cream">{cert.name}</p>
                    <p className="text-xs text-ink-soft/60 dark:text-parchment-dark/50">{cert.provider}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <a href={cert.link} target="_blank" rel="noreferrer" className="text-gold hover:text-gold-dark underline underline-offset-2">
                        View cert
                      </a>
                      <span className="text-ink-soft/60 dark:text-parchment-dark/50">{cert.studyDays}-day plan</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-soft/60 dark:text-parchment-dark/50">
                Suggested study plan: {sampleReport.gaps.studyPlanDays} days total.
              </p>
            </div>
          </Card>

          {/* Pivot Pathways Card */}
          <Card className="space-y-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-cream">Pivot Pathways</h3>
              <Badge variant="gold" className="text-[10px]">Sample</Badge>
            </div>
            
            <div className="grid gap-5 md:grid-cols-3">
              {sampleReport.pivotPathways.pivots.map((pivot, index) => (
                <div 
                  key={pivot.industry} 
                  className="group rounded-xl border border-gold/20 bg-gradient-to-br from-cream/60 to-parchment/40 p-5 hover:border-gold/40 hover:shadow-card transition-all duration-300 dark:from-navy/60 dark:to-navy-deep/40"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">{pivot.industry}</p>
                  <p className="mt-2 font-semibold text-ink dark:text-cream">
                    {pivot.role_titles.join(", ")}
                  </p>
                  
                  <ul className="mt-4 space-y-1.5 text-xs text-ink-soft/80 dark:text-parchment-dark/70">
                    {pivot.why_you_fit.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="flex-shrink-0 mt-1 h-1 w-1 rounded-full bg-sage" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <ul className="mt-3 space-y-1.5 text-xs text-ink-soft/70 dark:text-parchment-dark/60">
                    {pivot.pivot_narrative_bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="flex-shrink-0 mt-1 h-1 w-1 rounded-full bg-gold/40" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pivot.recommended_certs.map((cert) => (
                      <a
                        key={cert.name}
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] text-gold hover:bg-gold/15 hover:border-gold/50 transition-colors duration-200"
                      >
                        {cert.name}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top 10 Jobs Card */}
          <Card className="space-y-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-cream">Top 10 jobs</h3>
              <Badge variant="gold" className="text-[10px]">Sample</Badge>
            </div>
            
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20">
                    <th className="py-3 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Role</th>
                    <th className="py-3 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Company</th>
                    <th className="py-3 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Fit</th>
                    <th className="py-3 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Ghost</th>
                    <th className="py-3 pr-4 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Source</th>
                    <th className="py-3 text-left text-[10px] uppercase tracking-[0.2em] text-gold font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {sampleReport.jobs.map((job, index) => (
                    <tr 
                      key={`${job.company}-${job.role}`} 
                      className="border-b border-gold/10 hover:bg-gold/[0.03] transition-colors duration-150"
                    >
                      <td className="py-4 pr-4 font-medium text-ink dark:text-cream">{job.role}</td>
                      <td className="py-4 pr-4 text-ink-soft dark:text-parchment-dark">{job.company}</td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-sage/20 text-xs font-semibold text-sage">
                          {job.fitScore}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber/20 text-xs font-semibold text-amber">
                          {job.ghostScore}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-ink-soft/70 dark:text-parchment-dark/60 text-xs">{job.source}</td>
                      <td className="py-4">
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium text-gold hover:bg-gold/15 hover:border-gold/50 transition-colors duration-200"
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

          {/* Outreach Pack Card */}
          <Card className="space-y-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-cream">Outreach pack</h3>
              <Badge variant="gold" className="text-[10px]">Sample</Badge>
            </div>
            
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Hiring manager email</p>
                <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-gold/20 bg-gradient-to-br from-cream/60 to-parchment/40 p-4 text-xs text-ink-soft leading-relaxed dark:from-navy/60 dark:to-navy-deep/40 dark:text-parchment-dark">
                  {sampleReport.outreach.hiringManagerEmail}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Recruiter email</p>
                <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-gold/20 bg-gradient-to-br from-cream/60 to-parchment/40 p-4 text-xs text-ink-soft leading-relaxed dark:from-navy/60 dark:to-navy-deep/40 dark:text-parchment-dark">
                  {sampleReport.outreach.recruiterEmail}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">LinkedIn note</p>
                <div className="mt-3 rounded-xl border border-gold/20 bg-gradient-to-br from-cream/60 to-parchment/40 p-4 text-xs text-ink-soft leading-relaxed dark:from-navy/60 dark:to-navy-deep/40 dark:text-parchment-dark">
                  {sampleReport.outreach.linkedinNote}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">14-day cadence</p>
                <ul className="mt-3 space-y-2 text-xs text-ink-soft dark:text-parchment-dark">
                  {sampleReport.outreach.cadence.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-gold/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ Section
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="py-16 md:py-24">
        <PageHeaderCentered 
          title="FAQ" 
          subtitle="Clear answers for busy leaders."
        />
        
        <div className="mt-12 grid gap-4 md:grid-cols-2">
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
              q: "What does 'Ghost Score' mean?",
              a: "Ghost Score estimates the likelihood a posting is stale, unclear, or not actively hiring. Lower score = healthier signal. It helps you avoid time-wasting dead-end applications."
            },
            {
              q: "Do you apply to jobs for me?",
              a: "Not yet. Today we deliver the highest-quality shortlist and outreach kit so you can execute quickly. Premium tiers include Executive QA so you're applying with assets that win."
            },
            {
              q: "Can you target a specific role or job URL?",
              a: "Yes. You can submit a target title, company, and/or job URL. We'll calibrate your resume and shortlist around that target and adjacent roles you can realistically win."
            },
            {
              q: "Do you support contract roles?",
              a: "Yes. Toggle 'Contract OK' during intake. We'll include contract-to-hire and urgent contract roles when appropriate."
            },
            {
              q: "How fast is delivery?",
              a: "Most reports deliver in 3–5 business days. Higher tiers can include priority turnaround."
            },
            {
              q: "Do you offer refunds?",
              a: "We don't offer refunds. However — we do guarantee delivery. If we don't source real roles that match your constraints (remote-only, seniority, salary floor, titles, etc.), we will re-run the sourcing and scoring pipeline until we do."
            },
            {
              q: "Is AI generating everything?",
              a: "AI accelerates the work. We still operate with quality gates. Premium tiers include Executive QA by seasoned operators (15+ years) to ensure accuracy, clarity, and professionalism before delivery."
            },
            {
              q: "What industries do you support?",
              a: "We specialize in high-signal roles in tech, SaaS, ops, product, finance, and business leadership. If you're an operator, specialist, or exec — this is built for you."
            }
          ].map((item, index) => (
            <Card 
              key={item.q} 
              className="group hover:border-gold/30 transition-colors duration-200"
            >
              <h4 className="text-base font-semibold text-ink dark:text-cream group-hover:text-gold-dark dark:group-hover:text-gold transition-colors duration-200">
                {item.q}
              </h4>
              <p className="mt-3 text-sm text-ink-soft/80 dark:text-parchment-dark/70 leading-relaxed">{item.a}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          Footer CTA Section
          ═══════════════════════════════════════════════════════════════════ */}
      <Section className="py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-ink-soft/60 dark:text-parchment-dark/50">
          <p>Support: support@cljobmatch.com</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-gold transition-colors duration-200">
              Terms
            </a>
            <a href="#" className="hover:text-gold transition-colors duration-200">
              Privacy
            </a>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}

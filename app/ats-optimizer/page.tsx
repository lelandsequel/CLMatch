"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { Section } from "../../components/section";
import { PageHeaderCentered } from "../../components/page-header";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  TemplateSelector,
  OnePageToggle,
  ATSScoreComparison,
  Testimonials,
  PDFDownloadButton,
  type ResumeTemplate,
} from "../../components/ats";
import { PolicyNote } from "../../components/policy-note";

function ATSOptimizerContent() {
  const searchParams = useSearchParams();
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [template, setTemplate] = useState<ResumeTemplate>("clean-modern");
  const [condensed, setCondensed] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState("");
  const [atsScores, setAtsScores] = useState<{
    before: number;
    after: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  // Check for payment success on mount
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const paid = searchParams.get("paid");
    if (sessionId || paid === "true") {
      setUnlocked(true);
      // Restore results from sessionStorage if available
      const savedResults = sessionStorage.getItem("ats_results");
      if (savedResults) {
        const { resume: savedResume, scores } = JSON.parse(savedResults);
        setOptimizedResume(savedResume);
        setAtsScores(scores);
      }
    }
  }, [searchParams]);

  const handleOptimize = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and the job description.");
      return;
    }

    setIsLoading(true);
    setError("");
    setOptimizedResume("");
    setAtsScores(null);
    setUnlocked(false);

    try {
      const response = await fetch("/api/ats-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          jobDescription,
          template,
          condensedToOnePage: condensed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to optimize resume");
      }

      setOptimizedResume(data.optimizedResume);
      setAtsScores(data.atsScores);
      
      // Save to sessionStorage for post-payment retrieval
      sessionStorage.setItem("ats_results", JSON.stringify({
        resume: data.optimizedResume,
        scores: data.atsScores,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tierId: "ats_single",
          successUrl: `${window.location.origin}/ats-optimizer?paid=true`,
          cancelUrl: `${window.location.origin}/ats-optimizer`,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
        setIsUnlocking(false);
      }
    } catch (err) {
      setError("Failed to connect to payment service");
      setIsUnlocking(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimizedResume);
  };

  const handleDownloadText = () => {
    const blob = new Blob([optimizedResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-resume.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Create a preview version (first 300 chars + blur indicator)
  const getPreviewText = () => {
    if (!optimizedResume) return "";
    const preview = optimizedResume.slice(0, 300);
    return preview + (optimizedResume.length > 300 ? "..." : "");
  };

  return (
    <AppShell>
      <Section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="gold" className="mb-4">
              ATS Optimizer
            </Badge>
            <PageHeaderCentered
              title="Beat the resume robots."
              subtitle="75% of resumes are rejected by ATS before a human ever sees them. Our AI optimizer can increase your chances of getting through by up to 70%."
            />
          </div>

          {/* Main Optimizer Card */}
          <Card className="p-8 mb-12">
            {/* Template Selector */}
            <TemplateSelector selected={template} onSelect={setTemplate} />

            {/* One-Page Toggle */}
            <div className="mb-8">
              <OnePageToggle enabled={condensed} onToggle={setCondensed} />
            </div>

            {/* Input Fields */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-ink dark:text-cream mb-2">
                  Your Current Resume
                </label>
                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Paste your current resume here..."
                  className="w-full h-64 p-4 rounded-xl border border-mist/50 dark:border-ink-soft/30 bg-parchment/50 dark:bg-ink/50 text-ink dark:text-cream placeholder:text-ink-soft/50 dark:placeholder:text-parchment-dark/50 resize-none focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink dark:text-cream mb-2">
                  Target Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description you're applying for..."
                  className="w-full h-64 p-4 rounded-xl border border-mist/50 dark:border-ink-soft/30 bg-parchment/50 dark:bg-ink/50 text-ink dark:text-cream placeholder:text-ink-soft/50 dark:placeholder:text-parchment-dark/50 resize-none focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Optimize Button */}
            <div className="text-center mb-8">
              <Button
                variant="gold"
                onClick={handleOptimize}
                disabled={isLoading}
                className="px-8 py-3 text-base"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Optimizing...
                  </span>
                ) : (
                  "Optimize My Resume — Free Preview"
                )}
              </Button>
            </div>

            {/* Results Section */}
            {optimizedResume && (
              <div className="border-t border-mist/30 dark:border-ink-soft/20 pt-8">
                {/* ATS Scores - Always visible */}
                {atsScores && (
                  <ATSScoreComparison
                    beforeScore={atsScores.before}
                    afterScore={atsScores.after}
                  />
                )}

                {unlocked ? (
                  /* UNLOCKED: Full results */
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-ink dark:text-cream">
                        Your Optimized Resume
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleCopy}>
                          Copy Text
                        </Button>
                        <Button variant="secondary" onClick={handleDownloadText}>
                          Download .txt
                        </Button>
                        <PDFDownloadButton 
                          resumeText={optimizedResume} 
                          template={template}
                        />
                      </div>
                    </div>
                    <div className="p-6 rounded-xl border border-green-500/20 bg-green-500/5 dark:bg-green-500/10">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-ink dark:text-cream leading-relaxed">
                        {optimizedResume}
                      </pre>
                    </div>
                  </div>
                ) : (
                  /* LOCKED: Preview + unlock CTA */
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-ink dark:text-cream">
                        Preview — Unlock Full Results
                      </h3>
                    </div>
                    
                    {/* Blurred preview */}
                    <div className="relative">
                      <div className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-ink dark:text-cream leading-relaxed">
                          {getPreviewText()}
                        </pre>
                        {/* Blur overlay */}
                        <div className="absolute inset-0 top-24 bg-gradient-to-b from-transparent via-parchment/80 to-parchment dark:via-slate-950/80 dark:to-slate-950 rounded-b-xl" />
                      </div>
                      
                      {/* Unlock CTA overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center justify-center">
                        <div className="text-center mb-4">
                          <p className="text-lg font-semibold text-ink dark:text-cream mb-1">
                            Your optimized resume is ready!
                          </p>
                          <p className="text-sm text-ink-soft dark:text-parchment-dark">
                            Unlock full text, copy, and PDF download
                          </p>
                        </div>
                        <Button
                          variant="gold"
                          onClick={handleUnlock}
                          disabled={isUnlocking}
                          className="px-8 py-3 text-base shadow-lg"
                        >
                          {isUnlocking ? (
                            <span className="flex items-center gap-2">
                              <svg
                                className="animate-spin h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Redirecting...
                            </span>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Unlock Full Results — $24.99
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Testimonials */}
          <Testimonials />
          
          {/* Policy Note */}
          <PolicyNote className="mb-12" />

          {/* Monthly Plan CTA */}
          <Card className="p-8 text-center bg-gradient-to-br from-gold/10 via-amber/5 to-gold/10 border-gold/30 mb-12">
            <Badge variant="gold" className="mb-4">Best Value</Badge>
            <h3 className="text-2xl font-bold text-ink dark:text-cream mb-2">
              Need unlimited optimizations?
            </h3>
            <p className="text-ink-soft dark:text-parchment-dark mb-2">
              Get unlimited ATS optimizations + 15% off premium packages
            </p>
            <p className="text-3xl font-bold text-ink dark:text-cream mb-6">
              $59.99<span className="text-lg font-normal text-ink-soft">/month</span>
            </p>
            <Button 
              variant="gold" 
              className="px-8"
              onClick={() => {
                fetch("/api/stripe/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tierId: "ats_monthly" }),
                })
                  .then(res => res.json())
                  .then(data => {
                    if (data.url) window.location.href = data.url;
                  });
              }}
            >
              Go Pro — Unlimited Access
            </Button>
          </Card>

          {/* CTA to Full Service */}
          <Card className="p-8 text-center">
            <h3 className="text-2xl font-bold text-ink dark:text-cream mb-2">
              Want us to handle everything?
            </h3>
            <p className="text-ink-soft dark:text-parchment-dark mb-6 max-w-xl mx-auto">
              Get a complete job search package: hand-picked roles, ATS-optimized resume, 
              outreach scripts, and expert human review. Let C&L do the heavy lifting.
            </p>
            <Link href="/pricing">
              <Button variant="primary" className="px-8">
                Explore Full Job Match Services →
              </Button>
            </Link>
          </Card>
        </div>
      </Section>
    </AppShell>
  );
}

export default function ATSOptimizerPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <Section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-ink-soft">Loading...</p>
          </div>
        </Section>
      </AppShell>
    }>
      <ATSOptimizerContent />
    </Suspense>
  );
}

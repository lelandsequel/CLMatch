"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardPremium } from "../../components/ui/card";

const defaultState = {
  full_name: "",
  email: "",
  linkedin_url: "",
  target_titles: "",
  seniority: "IC",
  remote_only: true,
  contract_ok: false,
  salary_min: "",
  industries_prefer: "",
  industries_avoid: "",
  target_job_url: "",
  target_jd: ""
};

type Step = 1 | 2 | 3;

type Props = {
  sessionId: string;
  tier: string;
  devMode: boolean;
  isAllowed: boolean;
};

export default function IntakeForm({ sessionId, tier, devMode, isAllowed }: Props) {
  const [form, setForm] = useState(defaultState);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = (key: keyof typeof defaultState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const stepLabels = useMemo(() => ["Basics", "Preferences", "Upload"] as const, []);
  const currentLabel = stepLabels[step - 1] ?? "Basics";

  const validateStep = (currentStep: Step) => {
    const nextErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.full_name.trim()) nextErrors.full_name = "Full name is required.";
      if (!form.email.trim()) nextErrors.email = "Email is required.";
    }
    if (currentStep === 2) {
      if (!form.target_titles.trim()) nextErrors.target_titles = "Target titles required.";
    }
    if (currentStep === 3) {
      if (!resumeFile) nextErrors.resume = "Resume file is required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((prev) => (prev < 3 ? ((prev + 1) as Step) : prev));
  };

  const back = () => setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));

  const submit = async () => {
    if (!validateStep(3)) return;
    setStatus("submitting");
    setMessage("");

    const body = new FormData();
    body.append("session_id", sessionId);
    body.append("tier", tier);
    body.append("full_name", form.full_name);
    body.append("email", form.email);
    body.append("linkedin_url", form.linkedin_url);
    body.append("target_titles", form.target_titles);
    body.append("seniority", form.seniority);
    body.append("remote_only", String(form.remote_only));
    body.append("contract_ok", String(form.contract_ok));
    body.append("salary_min", form.salary_min);
    body.append("industries_prefer", form.industries_prefer);
    body.append("industries_avoid", form.industries_avoid);
    body.append("target_job_url", form.target_job_url);
    body.append("target_jd", form.target_jd);
    if (resumeFile) body.append("resume", resumeFile);

    try {
      const response = await fetch("/api/intake/submit", {
        method: "POST",
        body
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Submission failed");
        return;
      }
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed");
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) setResumeFile(file);
  };

  const isDisabled = !isAllowed || status === "submitting";

  return (
    <CardPremium className="space-y-8 animate-fade-in-up">
      {devMode ? (
        <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 to-amber/5 p-4 text-xs">
          <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
          <span className="text-gold-dark dark:text-gold">DEV MODE active. Intake will create a draft order without Stripe.</span>
        </div>
      ) : null}

      {/* Privacy notice */}
      <div className="rounded-xl border border-gold/20 bg-gradient-to-r from-cream/60 to-parchment/40 p-4 text-xs text-ink-soft/70 dark:from-navy/60 dark:to-navy-deep/40 dark:text-parchment-dark/60">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
          <span>Private. Stored securely. Not shared.</span>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em]">
        {stepLabels.map((label, index) => {
          const isActive = label === currentLabel;
          const isComplete = index < step - 1;
          return (
            <div key={label} className="flex items-center gap-2.5 group">
              <span
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-br from-gold to-gold-dark shadow-glow" 
                    : isComplete 
                      ? "bg-sage" 
                      : "bg-mist dark:bg-navy-deep"
                }`}
              />
              <span className={`transition-colors duration-200 ${
                isActive 
                  ? "text-gold font-semibold" 
                  : isComplete 
                    ? "text-sage" 
                    : "text-ink-soft/50 dark:text-parchment-dark/40"
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Basics */}
      {step === 1 ? (
        <div className="space-y-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Basic Information</p>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">Full name *</label>
              <Input
                placeholder="John Smith"
                value={form.full_name}
                onChange={(event) => update("full_name", event.target.value)}
                disabled={isDisabled}
              />
              {errors.full_name ? <p className="text-xs text-terracotta">{errors.full_name}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">Email *</label>
              <Input
                type="email"
                placeholder="john@company.com"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                disabled={isDisabled}
              />
              {errors.email ? <p className="text-xs text-terracotta">{errors.email}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">LinkedIn URL</label>
              <Input
                placeholder="linkedin.com/in/yourprofile"
                value={form.linkedin_url}
                onChange={(event) => update("linkedin_url", event.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">Seniority level</label>
              <Input
                placeholder="IC / Manager / Director"
                value={form.seniority}
                onChange={(event) => update("seniority", event.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Step 2: Preferences */}
      {step === 2 ? (
        <div className="space-y-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Job Preferences</p>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">Target titles *</label>
              <Input
                placeholder="Product Manager, Senior PM"
                value={form.target_titles}
                onChange={(event) => update("target_titles", event.target.value)}
                disabled={isDisabled}
              />
              {errors.target_titles ? (
                <p className="text-xs text-terracotta">{errors.target_titles}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">Salary minimum</label>
              <Input
                placeholder="$150,000"
                value={form.salary_min}
                onChange={(event) => update("salary_min", event.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">Industries prefer</label>
              <Input
                placeholder="SaaS, Fintech, Healthcare"
                value={form.industries_prefer}
                onChange={(event) => update("industries_prefer", event.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">Industries avoid</label>
              <Input
                placeholder="Crypto, Gambling"
                value={form.industries_avoid}
                onChange={(event) => update("industries_avoid", event.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 pt-4 border-t border-gold/10">
            <label className="group flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.remote_only}
                  onChange={(event) => update("remote_only", event.target.checked)}
                  disabled={isDisabled}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded-md border border-gold/30 bg-gradient-to-br from-cream/80 to-parchment/60 peer-checked:bg-gradient-to-br peer-checked:from-gold peer-checked:to-gold-dark peer-checked:border-gold transition-all duration-200 dark:from-navy/80 dark:to-navy-deep/60" />
                <svg className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-ink-soft dark:text-parchment-dark group-hover:text-ink dark:group-hover:text-cream transition-colors duration-200">
                Remote only
              </span>
            </label>
            
            <label className="group flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.contract_ok}
                  onChange={(event) => update("contract_ok", event.target.checked)}
                  disabled={isDisabled}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded-md border border-gold/30 bg-gradient-to-br from-cream/80 to-parchment/60 peer-checked:bg-gradient-to-br peer-checked:from-gold peer-checked:to-gold-dark peer-checked:border-gold transition-all duration-200 dark:from-navy/80 dark:to-navy-deep/60" />
                <svg className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-ink-soft dark:text-parchment-dark group-hover:text-ink dark:group-hover:text-cream transition-colors duration-200">
                Contract ok
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {/* Step 3: Upload */}
      {step === 3 ? (
        <div className="space-y-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Target Job & Resume</p>
          
          <div className="space-y-2">
            <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">Target job URL</label>
            <Input
              placeholder="https://jobs.lever.co/company/role"
              value={form.target_job_url}
              onChange={(event) => update("target_job_url", event.target.value)}
              disabled={isDisabled}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-ink-soft/70 dark:text-parchment-dark/60">Target job description</label>
            <Textarea
              placeholder="Paste the full job description here..."
              value={form.target_jd}
              onChange={(event) => update("target_jd", event.target.value)}
              disabled={isDisabled}
              rows={4}
            />
          </div>
          
          {/* File upload zone */}
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            className={`group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 transition-all duration-300 ${
              resumeFile 
                ? "border-sage/50 bg-gradient-to-br from-sage/10 to-sage/5" 
                : "border-gold/30 bg-gradient-to-br from-cream/60 to-parchment/40 hover:border-gold/50 hover:bg-gradient-to-br hover:from-gold/10 hover:to-amber/5 dark:from-navy/60 dark:to-navy-deep/40"
            }`}
          >
            {/* Upload icon */}
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 ${
              resumeFile 
                ? "bg-sage/20 text-sage" 
                : "bg-gold/10 text-gold group-hover:bg-gold/20"
            }`}>
              {resumeFile ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-ink-soft dark:text-parchment-dark">
                {resumeFile ? (
                  <span className="font-medium text-sage">Selected: {resumeFile.name}</span>
                ) : (
                  "Drag & drop your resume (PDF/DOCX)"
                )}
              </p>
              {!resumeFile && (
                <p className="mt-1 text-xs text-ink-soft/60 dark:text-parchment-dark/50">or click to browse</p>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-gold/30 bg-gradient-to-r from-cream/80 to-parchment/60 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gold hover:border-gold/50 hover:shadow-soft transition-all duration-200 dark:from-navy/80 dark:to-navy-deep/60"
            >
              {resumeFile ? "Change file" : "Browse file"}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
              className="hidden"
              disabled={isDisabled}
            />
            
            {errors.resume ? <p className="text-xs text-terracotta">{errors.resume}</p> : null}
          </div>
        </div>
      ) : null}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gold/10">
        <Button variant="ghost" onClick={back} disabled={step === 1 || isDisabled}>
          ← Back
        </Button>
        {step < 3 ? (
          <Button variant="gold" onClick={next} disabled={isDisabled}>
            Continue →
          </Button>
        ) : (
          <Button variant="gold" onClick={submit} disabled={isDisabled}>
            {status === "submitting" ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Submitting...
              </span>
            ) : (
              "Submit intake"
            )}
          </Button>
        )}
      </div>

      {/* Status messages */}
      {status === "success" ? (
        <div className="flex items-center gap-3 rounded-xl border border-sage/30 bg-gradient-to-r from-sage/10 to-sage/5 p-4">
          <span className="h-2 w-2 rounded-full bg-sage animate-pulse" />
          <p className="text-sm text-sage font-medium">
            Intake submitted. We are processing your report now.
          </p>
        </div>
      ) : null}
      
      {status === "error" ? (
        <div className="flex items-center gap-3 rounded-xl border border-terracotta/30 bg-gradient-to-r from-terracotta/10 to-terracotta/5 p-4">
          <span className="h-2 w-2 rounded-full bg-terracotta" />
          <p className="text-sm text-terracotta">{message}</p>
        </div>
      ) : null}
    </CardPremium>
  );
}

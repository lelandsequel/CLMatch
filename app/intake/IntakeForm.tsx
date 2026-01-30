"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "../../components/ui/button";

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

/* Glass card component */
function GlassCard({ 
  children, 
  className = ""
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`p-8 rounded-xl backdrop-blur-sm bg-white/10 border border-white/15 ${className}`}>
      {children}
    </div>
  );
}

/* Glass input component */
function GlassInput({ 
  type = "text",
  placeholder,
  value,
  onChange,
  disabled
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 text-sm text-white placeholder:text-white/40 focus:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/10 transition-all duration-200 disabled:opacity-50"
    />
  );
}

/* Glass textarea component */
function GlassTextarea({ 
  placeholder,
  value,
  onChange,
  disabled,
  rows = 4
}: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
      className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/10 transition-all duration-200 disabled:opacity-50 resize-none"
    />
  );
}

export default function IntakeForm({ sessionId, tier, devMode, isAllowed }: Props) {
  const [form, setForm] = useState(defaultState);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "pending" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
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

  const pollOrderStatus = async (orderId: string) => {
    const maxAttempts = 120; // 10 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/orders/status?orderId=${orderId}`);
        const data = await response.json();
        
        if (data.is_complete) {
          setStatus("success");
          setMessage("Your report is ready! Check your dashboard.");
          return;
        }
        
        if (data.is_error) {
          setStatus("error");
          setMessage(data.message || "Something went wrong. We'll reach out.");
          return;
        }
        
        // Update status message
        setMessage(data.message || "Processing...");
        if (data.status === "processing") {
          setStatus("processing");
        }
        
      } catch {
        // Ignore polling errors, keep trying
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
    }
    
    // Timeout - but order is still processing
    setStatus("success");
    setMessage("Your intake is being processed. We'll email you when ready.");
  };

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
      const data = (await response.json()) as { error?: string; order_id?: string; status?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Submission failed");
        return;
      }
      
      // Submission successful - now poll for processing status
      if (data.order_id) {
        setOrderId(data.order_id);
        setStatus("pending");
        setMessage("Intake received! Processing will begin shortly...");
        pollOrderStatus(data.order_id);
      } else {
        setStatus("success");
        setMessage("Intake submitted successfully.");
      }
      
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

  const isDisabled = !isAllowed || status === "submitting" || status === "pending" || status === "processing" || status === "success";

  return (
    <GlassCard className="space-y-8 animate-fade-in-up">
      {devMode ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-xs">
          <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
          <span className="text-amber-200">DEV MODE active. Intake will create a draft order without Stripe.</span>
        </div>
      ) : null}

      {/* Privacy notice */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
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
                    ? "bg-gradient-to-br from-amber-300 to-amber-500 shadow-glow" 
                    : isComplete 
                      ? "bg-green-400" 
                      : "bg-white/20"
                }`}
              />
              <span className={`transition-colors duration-200 ${
                isActive 
                  ? "text-amber-300 font-semibold" 
                  : isComplete 
                    ? "text-green-400" 
                    : "text-white/40"
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">Basic Information</p>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-white/60">Full name *</label>
              <GlassInput
                placeholder="John Smith"
                value={form.full_name}
                onChange={(event) => update("full_name", event.target.value)}
                disabled={isDisabled}
              />
              {errors.full_name ? <p className="text-xs text-red-400">{errors.full_name}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Email *</label>
              <GlassInput
                type="email"
                placeholder="john@company.com"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                disabled={isDisabled}
              />
              {errors.email ? <p className="text-xs text-red-400">{errors.email}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">LinkedIn URL</label>
              <GlassInput
                placeholder="linkedin.com/in/yourprofile"
                value={form.linkedin_url}
                onChange={(event) => update("linkedin_url", event.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Seniority level</label>
              <GlassInput
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">Job Preferences</p>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-white/60">Target titles *</label>
              <GlassInput
                placeholder="Product Manager, Senior PM"
                value={form.target_titles}
                onChange={(event) => update("target_titles", event.target.value)}
                disabled={isDisabled}
              />
              {errors.target_titles ? (
                <p className="text-xs text-red-400">{errors.target_titles}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Salary minimum</label>
              <GlassInput
                placeholder="$150,000"
                value={form.salary_min}
                onChange={(event) => update("salary_min", event.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Industries prefer</label>
              <GlassInput
                placeholder="SaaS, Fintech, Healthcare"
                value={form.industries_prefer}
                onChange={(event) => update("industries_prefer", event.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Industries avoid</label>
              <GlassInput
                placeholder="Crypto, Gambling"
                value={form.industries_avoid}
                onChange={(event) => update("industries_avoid", event.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
            <label className="group flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.remote_only}
                  onChange={(event) => update("remote_only", event.target.checked)}
                  disabled={isDisabled}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded-md border border-white/30 bg-white/10 peer-checked:bg-gradient-to-br peer-checked:from-amber-300 peer-checked:to-amber-500 peer-checked:border-amber-300 transition-all duration-200" />
                <svg className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-white/70 group-hover:text-white transition-colors duration-200">
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
                <div className="h-5 w-5 rounded-md border border-white/30 bg-white/10 peer-checked:bg-gradient-to-br peer-checked:from-amber-300 peer-checked:to-amber-500 peer-checked:border-amber-300 transition-all duration-200" />
                <svg className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-white/70 group-hover:text-white transition-colors duration-200">
                Contract ok
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {/* Step 3: Upload */}
      {step === 3 ? (
        <div className="space-y-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-medium">Target Job & Resume</p>
          
          <div className="space-y-2">
            <label className="text-xs text-white/60">Target job URL</label>
            <GlassInput
              placeholder="https://jobs.lever.co/company/role"
              value={form.target_job_url}
              onChange={(event) => update("target_job_url", event.target.value)}
              disabled={isDisabled}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-white/60">Target job description</label>
            <GlassTextarea
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
                ? "border-green-400/50 bg-green-500/10" 
                : "border-white/30 bg-white/5 hover:border-amber-300/50 hover:bg-amber-300/10"
            }`}
          >
            {/* Upload icon */}
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 ${
              resumeFile 
                ? "bg-green-500/20 text-green-400" 
                : "bg-white/10 text-amber-300 group-hover:bg-amber-300/20"
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
              <p className="text-sm text-white/70">
                {resumeFile ? (
                  <span className="font-medium text-green-400">Selected: {resumeFile.name}</span>
                ) : (
                  "Drag & drop your resume (PDF/DOCX)"
                )}
              </p>
              {!resumeFile && (
                <p className="mt-1 text-xs text-white/50">or click to browse</p>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-amber-300/30 bg-amber-300/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-amber-200 hover:border-amber-300/50 hover:bg-amber-300/20 transition-all duration-200"
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
            
            {errors.resume ? <p className="text-xs text-red-400">{errors.resume}</p> : null}
          </div>
        </div>
      ) : null}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" onClick={back} disabled={step === 1 || isDisabled}>
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
            ) : status === "pending" || status === "processing" ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Processing...
              </span>
            ) : status === "success" ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Complete
              </span>
            ) : (
              "Submit intake"
            )}
          </Button>
        )}
      </div>

      {/* Status messages */}
      {status === "pending" || status === "processing" ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <div>
            <p className="text-sm text-amber-300 font-medium">
              {status === "pending" ? "Queued" : "Processing"}
            </p>
            <p className="text-xs text-amber-200/70 mt-1">{message}</p>
          </div>
        </div>
      ) : null}
      
      {status === "success" ? (
        <div className="flex items-center gap-3 rounded-xl border border-green-400/30 bg-green-500/10 p-4">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-sm text-green-300 font-medium">
            {message || "Your report is ready! Check your dashboard."}
          </p>
        </div>
      ) : null}
      
      {status === "error" ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <p className="text-sm text-red-300">{message}</p>
        </div>
      ) : null}
    </GlassCard>
  );
}

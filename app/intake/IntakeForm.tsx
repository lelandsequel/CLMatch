"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card } from "../../components/ui/card";

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
    <Card className="space-y-6">
      {devMode ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          DEV MODE active. Intake will create a draft order without Stripe.
        </div>
      ) : null}

      <div className="rounded-xl border border-mist bg-white p-4 text-xs text-slate-500">
        <p>Private. Stored securely. Not shared.</p>
      </div>

      <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-400">
        {stepLabels.map((label, index) => {
          const isActive = label === currentLabel;
          const isComplete = index < step - 1;
          return (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${isActive || isComplete ? "bg-accent" : "bg-mist dark:bg-slate-700"}`}
              />
              <span className={isActive ? "text-ink dark:text-white" : ""}>{label}</span>
            </div>
          );
        })}
      </div>

      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input
              placeholder="Full name"
              value={form.full_name}
              onChange={(event) => update("full_name", event.target.value)}
              disabled={isDisabled}
            />
            {errors.full_name ? <p className="mt-1 text-xs text-rose-600">{errors.full_name}</p> : null}
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              disabled={isDisabled}
            />
            {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email}</p> : null}
          </div>
          <Input
            placeholder="LinkedIn URL (optional)"
            value={form.linkedin_url}
            onChange={(event) => update("linkedin_url", event.target.value)}
            disabled={isDisabled}
          />
          <Input
            placeholder="Seniority (IC/Mgr/Dir)"
            value={form.seniority}
            onChange={(event) => update("seniority", event.target.value)}
            disabled={isDisabled}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input
              placeholder="Target titles (comma)"
              value={form.target_titles}
              onChange={(event) => update("target_titles", event.target.value)}
              disabled={isDisabled}
            />
            {errors.target_titles ? (
              <p className="mt-1 text-xs text-rose-600">{errors.target_titles}</p>
            ) : null}
          </div>
          <Input
            placeholder="Salary minimum (optional)"
            value={form.salary_min}
            onChange={(event) => update("salary_min", event.target.value)}
            disabled={isDisabled}
          />
          <Input
            placeholder="Industries prefer (comma)"
            value={form.industries_prefer}
            onChange={(event) => update("industries_prefer", event.target.value)}
            disabled={isDisabled}
          />
          <Input
            placeholder="Industries avoid (comma)"
            value={form.industries_avoid}
            onChange={(event) => update("industries_avoid", event.target.value)}
            disabled={isDisabled}
          />
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.remote_only}
                onChange={(event) => update("remote_only", event.target.checked)}
                disabled={isDisabled}
              />
              Remote only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.contract_ok}
                onChange={(event) => update("contract_ok", event.target.checked)}
                disabled={isDisabled}
              />
              Contract ok
            </label>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <Input
            placeholder="Target job URL (optional)"
            value={form.target_job_url}
            onChange={(event) => update("target_job_url", event.target.value)}
            disabled={isDisabled}
          />
          <Textarea
            placeholder="Paste target job description (optional)"
            value={form.target_jd}
            onChange={(event) => update("target_jd", event.target.value)}
            disabled={isDisabled}
          />
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-mist bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900"
          >
            <p>Drag & drop your resume (PDF/DOCX) or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-mist px-4 py-2 text-xs font-semibold uppercase tracking-widest"
            >
              Browse file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
              className="hidden"
              disabled={isDisabled}
            />
            {resumeFile ? <p className="text-xs text-ink">Selected: {resumeFile.name}</p> : null}
            {errors.resume ? <p className="text-xs text-rose-600">{errors.resume}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 1 || isDisabled}>
          Back
        </Button>
        {step < 3 ? (
          <Button onClick={next} disabled={isDisabled}>Continue</Button>
        ) : (
          <Button onClick={submit} disabled={isDisabled}>
            {status === "submitting" ? "Submitting..." : "Submit intake"}
          </Button>
        )}
      </div>

      {status === "success" ? (
        <p className="text-sm text-emerald-600">
          Intake submitted. We are processing your report now.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-rose-600">{message}</p>
      ) : null}
    </Card>
  );
}

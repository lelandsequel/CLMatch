/**
 * ShipMachine augmentation layer for CLMatch.
 * Runs semantic re-scoring, gap analysis, and deep ghost checks
 * via PromptOS PromptSpecs after initial keyword scoring.
 */

import type { ScoredJob, ResumeProfile, JobPreferences } from "./types";

export interface RescoreResult {
  job_id: string;
  semantic_fit_score: number;
  semantic_reasons: string[];
  combined_score: number;
}

export interface GapAnalysis {
  missing_skills: string[];
  missing_keywords: string[];
  missing_certs: string[];
  undersold_strengths: string[];
  cover_letter_angles: string[];
  gap_severity: "low" | "medium" | "high";
}

export interface GhostDeepCheck {
  ghost_likelihood: number;
  signals_found: string[];
  signals_clear: string[];
  recommendation: string;
  reasoning: string;
}

export interface AugmentedJob extends ScoredJob {
  semantic_fit_score?: number;
  semantic_reasons?: string[];
  combined_score?: number;
  gap_analysis?: GapAnalysis;
  ghost_deep_check?: GhostDeepCheck;
  augmented_at?: string;
}

/**
 * Calls the ShipMachine/PromptOS execute() API.
 * Falls back gracefully if ShipMachine is not configured.
 */
export async function callPromptSpec(promptId: string, inputs: Record<string, unknown>): Promise<unknown> {
  const endpoint = process.env.SHIPMACHINE_ENDPOINT || process.env.PROMPTOS_ENDPOINT;
  const apiKey = process.env.SHIPMACHINE_API_KEY || process.env.PROMPTOS_API_KEY;

  if (!endpoint || !apiKey) {
    // Graceful fallback — augmentation is optional
    return null;
  }

  const response = await fetch(`${endpoint}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      promptId,
      inputs,
      role: "agent",
    }),
  });

  if (!response.ok) {
    console.warn(`[rescore] PromptSpec ${promptId} failed: ${response.status}`);
    return null;
  }

  const data = await response.json();
  return data.output ?? data;
}

/**
 * Semantic re-ranking of top N jobs.
 * Replaces pure keyword ordering with LLM semantic understanding.
 */
export async function semanticRescore(
  jobs: ScoredJob[],
  profile: ResumeProfile,
  prefs: JobPreferences,
  topN = 50
): Promise<Map<string, RescoreResult>> {
  const results = new Map<string, RescoreResult>();

  const topJobs = [...jobs]
    .sort((a, b) => b.fit_score - a.fit_score)
    .slice(0, topN);

  if (topJobs.length === 0) return results;

  const jobsPayload = topJobs.map((j) => ({
    job_id: j.dedupe_key,
    title: j.title,
    company: j.company_name,
    description: (j.description ?? "").slice(0, 1500), // trim for token budget
    keyword_score: j.fit_score,
  }));

  const resumeText = [
    `Skills: ${profile.skills.join(", ")}`,
    `Tools: ${profile.tools.join(", ")}`,
    `Roles: ${profile.roles.join(", ")}`,
    `Seniority: ${profile.seniority}`,
    `Industries: ${profile.industries.join(", ")}`,
    `Keywords: ${profile.keywords.join(", ")}`,
    profile.achievements?.length ? `Achievements: ${profile.achievements.join("; ")}` : "",
  ].filter(Boolean).join("\n");

  const output = await callPromptSpec("clmatch.semantic_rescore", {
    resume_text: resumeText,
    preferred_titles: prefs.preferred_titles,
    jobs_json: JSON.stringify(jobsPayload),
  }) as RescoreResult[] | null;

  if (Array.isArray(output)) {
    for (const item of output) {
      results.set(item.job_id, item);
    }
  }

  return results;
}

/**
 * Gap analysis for a specific job — used on user-selected jobs.
 */
export async function analyzeGap(
  job: ScoredJob,
  resumeText: string
): Promise<GapAnalysis | null> {
  const output = await callPromptSpec("clmatch.jd_gap_analysis", {
    resume_text: resumeText,
    job_description: (job.description ?? "").slice(0, 3000),
    job_title: job.title,
    company_name: job.company_name,
  });

  return output as GapAnalysis | null;
}

/**
 * Deep ghost check for a specific job.
 */
export async function deepGhostCheck(job: ScoredJob): Promise<GhostDeepCheck | null> {
  const output = await callPromptSpec("clmatch.ghost_deep_check", {
    company_name: job.company_name,
    job_title: job.title,
    job_description: (job.description ?? "").slice(0, 2000),
    posted_at: job.posted_at ?? "unknown",
    ats_type: job.ats_type,
  });

  return output as GhostDeepCheck | null;
}

/**
 * Full augmentation pipeline.
 * Run after initial scoring. Returns augmented jobs sorted by combined_score.
 */
export async function augmentJobs(
  jobs: ScoredJob[],
  profile: ResumeProfile,
  prefs: JobPreferences
): Promise<AugmentedJob[]> {
  const rescoreMap = await semanticRescore(jobs, profile, prefs);
  const now = new Date().toISOString();

  return jobs.map((job): AugmentedJob => {
    const rescore = rescoreMap.get(job.dedupe_key);
    return {
      ...job,
      semantic_fit_score: rescore?.semantic_fit_score,
      semantic_reasons: rescore?.semantic_reasons,
      combined_score: rescore?.combined_score ?? job.fit_score,
      augmented_at: now,
    };
  }).sort((a, b) => (b.combined_score ?? b.fit_score) - (a.combined_score ?? a.fit_score));
}

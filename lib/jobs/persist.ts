import type { PipelineInput, ScoredJob, JobSourceRecord } from "./types";
import { getServiceSupabase } from "../supabase/server";

export async function createJobRun(input: PipelineInput) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("job_runs")
    .insert({
      candidate_id: input.candidate_id,
      order_id: input.order_id ?? null,
      status: "running",
      preferences: input.preferences,
      resume_profile: input.resume_profile_json,
      target_job_description: input.target_job_description ?? null,
      target_job_url: input.target_job_url ?? null,
      max_results: input.max_results ?? 10
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updateJobRun(runId: string, updates: Record<string, unknown>) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("job_runs").update(updates).eq("id", runId);
  if (error) throw error;
}

export async function saveJobs(runId: string, candidateId: string, jobs: ScoredJob[]) {
  const supabase = getServiceSupabase();
  if (!jobs.length) return;

  const payload = jobs.map((job) => ({
    run_id: runId,
    candidate_id: candidateId,
    title: job.title,
    company_name: job.company_name,
    location: job.location,
    is_remote: job.is_remote,
    posted_at: job.posted_at ? new Date(job.posted_at).toISOString() : null,
    description: job.description,
    apply_url: job.apply_url,
    source_url: job.source_url,
    ats_type: job.ats_type,
    fit_score: job.fit_score,
    ghost_risk_score: job.ghost_risk_score,
    reasons_fit: job.reasons_fit,
    reasons_ghost: job.reasons_ghost,
    recommended_apply_path: job.recommended_apply_path,
    short_summary: job.short_summary,
    normalized_company: job.normalized_company,
    normalized_title: job.normalized_title,
    canonical_apply_url: job.canonical_apply_url,
    dedupe_key: job.dedupe_key
  }));

  const { error } = await supabase
    .from("jobs")
    .upsert(payload, { onConflict: "dedupe_key" });

  if (error) throw error;
}

export async function replaceJobsForRun(runId: string, candidateId: string, jobs: ScoredJob[]) {
  const supabase = getServiceSupabase();
  await supabase.from("jobs").delete().eq("run_id", runId);
  await saveJobs(runId, candidateId, jobs);
}

export async function saveJobSources(records: JobSourceRecord[]) {
  const supabase = getServiceSupabase();
  if (!records.length) return;
  const { error } = await supabase.from("job_sources").insert(records);
  if (error) throw error;
}

export async function fetchLatestRun(candidateId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("job_runs")
    .select("*, jobs(*)")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

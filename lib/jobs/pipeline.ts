import type { PipelineInput, PipelineResult, ParsedJob, ScoredJob, JobSourceRecord } from "./types";
import { discoverJobUrls } from "./discover";
import { fetchWithTimeout, RateLimiter, mapWithConcurrency } from "./http";
import { parseAtsHtml } from "./ats";
import { normalizeParsedJobs, detectAtsType } from "./normalize";
import { scoreJob } from "./score";
import { summarizeJob } from "./llm";
import { createJobRun, saveJobs, saveJobSources, updateJobRun } from "./persist";
import { augmentJobs } from "./rescore";

function isRemoteJob(job: ParsedJob) {
  if (job.is_remote) return true;
  const text = `${job.location ?? ""} ${job.description ?? ""}`.toLowerCase();
  return text.includes("remote") || text.includes("work from home");
}

function isContractJob(job: ParsedJob) {
  const text = `${job.title} ${job.description ?? ""}`.toLowerCase();
  return text.includes("contract") || text.includes("contractor") || text.includes("freelance");
}

function rankJobs(jobs: ScoredJob[]) {
  return jobs.sort((a, b) => {
    if (b.fit_score !== a.fit_score) return b.fit_score - a.fit_score;
    if (a.ghost_risk_score !== b.ghost_risk_score) return a.ghost_risk_score - b.ghost_risk_score;
    return (b.posted_at ? Date.parse(b.posted_at) : 0) - (a.posted_at ? Date.parse(a.posted_at) : 0);
  });
}

export async function runJobPipeline(input: PipelineInput): Promise<PipelineResult> {
  const runId = await createJobRun(input);
  const maxResults = input.max_results ?? 10;
  const limiter = new RateLimiter(Number(process.env.JOB_FETCH_INTERVAL_MS ?? 1200));
  const concurrency = Number(process.env.JOB_FETCH_CONCURRENCY ?? 3);
  const discovered = await discoverJobUrls(input.preferences, Number(process.env.JOB_DISCOVERY_MAX ?? 60));

  const jobSources: JobSourceRecord[] = [];
  const parsedJobs: ParsedJob[] = [];

  try {
    const fetchResults = await mapWithConcurrency(discovered, concurrency, async (entry) => {
      await limiter.wait();
      const atsType = detectAtsType(entry.url);
      if (atsType === "unknown") {
        return { status: "skipped" as const, url: entry.url };
      }

      try {
        const response = await fetchWithTimeout(entry.url, {
          timeoutMs: Number(process.env.JOB_FETCH_TIMEOUT_MS ?? 15000),
          headers: {
            "User-Agent": process.env.JOB_PIPELINE_USER_AGENT ?? "cl-job-match-bot/1.0"
          }
        });
        const html = await response.text();
        jobSources.push({
          url: entry.url,
          ats_type: atsType,
          http_status: response.status,
          fetched_at: new Date().toISOString(),
          raw_html: process.env.JOB_STORE_RAW_HTML === "true" ? html : null,
          error: response.ok ? null : `HTTP ${response.status}`
        });

        if (!response.ok) {
          return { status: "error" as const, url: entry.url };
        }

        const jobs = parseAtsHtml(atsType, html, entry.url);
        parsedJobs.push(...jobs);
        return { status: "ok" as const, url: entry.url, jobs: jobs.length };
      } catch (error) {
        jobSources.push({
          url: entry.url,
          ats_type: atsType,
          http_status: null,
          fetched_at: new Date().toISOString(),
          raw_html: null,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        return { status: "error" as const, url: entry.url };
      }
    });

    const normalized = normalizeParsedJobs(parsedJobs);
    const dedupedMap = new Map<string, typeof normalized[number]>();
    for (const job of normalized) {
      if (!job.title || !job.company_name) continue;
      if (input.preferences.remote_only && !isRemoteJob(job)) continue;
      if (!input.preferences.contract_ok && isContractJob(job)) continue;
      if (!dedupedMap.has(job.dedupe_key)) {
        dedupedMap.set(job.dedupe_key, job);
      }
    }

    const deduped = Array.from(dedupedMap.values());
    const scored: ScoredJob[] = [];

    for (const job of deduped) {
      const summary = await summarizeJob(job.description ?? "");
      scored.push(scoreJob(job, input.resume_profile_json, input.preferences, summary));
    }

    let scoredJobs = rankJobs(scored);

    // ShipMachine augmentation: semantic re-ranking, gap analysis, ghost deep check
    if (process.env.SHIPMACHINE_ENDPOINT || process.env.PROMPTOS_ENDPOINT) {
      scoredJobs = await augmentJobs(scoredJobs, input.resume_profile_json, input.preferences) as ScoredJob[];
    }

    const ranked = scoredJobs.slice(0, maxResults);

    await saveJobSources(jobSources);
    await saveJobs(runId, input.candidate_id, ranked);
    await updateJobRun(runId, { status: "completed", completed_at: new Date().toISOString() });

    return {
      run_id: runId,
      jobs: ranked,
      stats: {
        discovered: discovered.length,
        fetched: fetchResults.filter((r) => r.status === "ok").length,
        parsed: parsedJobs.length,
        deduped: deduped.length,
        scored: scored.length
      }
    };
  } catch (error) {
    await updateJobRun(runId, { status: "failed", error: error instanceof Error ? error.message : "Unknown error" });
    throw error;
  }
}

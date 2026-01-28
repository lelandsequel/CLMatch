import type { ScoredJob } from "../jobs/types";
import type { Tier } from "../pricing";
import type { JobPreferences } from "../jobs/types";
import type { ResumeProfile } from "../llm/extractResumeProfile";
import { runQC, type QCResult } from "./index";
import { runJobPipeline } from "../jobs/pipeline";
import { generateOutreach } from "../llm/generateOutreach";
import { generateCertsAndGaps } from "../llm/generateCertsAndGaps";

export type RepairInput = {
  orderId: string;
  tier: Tier;
  jobs: ScoredJob[];
  resumeProfile: ResumeProfile;
  resumeDraft: string;
  outreachDraft: string;
  gapDraft: string[];
  certDraft: string[];
  keywordMap: string[];
  targetTitles: string[];
  preferences: JobPreferences;
  target_job_url?: string | null;
  target_job_description?: string | null;
  fullName: string;
};

export type RepairResult = {
  qc: QCResult;
  jobs: ScoredJob[];
  runId?: string;
  resumeDraft: string;
  outreachDraft: string;
  gapDraft: string[];
  certDraft: string[];
  keywordMap: string[];
};

const MAX_ATTEMPTS = 2;

function stripUnsupportedLines(resumeDraft: string, flags: string[]) {
  const claims = flags.filter((flag) => flag.startsWith("resume_claim:")).map((flag) => flag.replace("resume_claim:", ""));
  if (!claims.length) return resumeDraft;
  const lines = resumeDraft.split("\n");
  const filtered = lines.filter((line) => !claims.some((claim) => claim && line.includes(claim)));
  return filtered.join("\n");
}

export async function repairArtifacts(input: RepairInput): Promise<RepairResult> {
  let jobs = input.jobs;
  let resumeDraft = input.resumeDraft;
  let outreachDraft = input.outreachDraft;
  let gapDraft = input.gapDraft;
  let certDraft = input.certDraft;
  let keywordMap = input.keywordMap;
  let runId: string | undefined;
  let qc: QCResult = await runQC({
    orderId: input.orderId,
    tier: input.tier,
    jobs,
    resumeProfile: input.resumeProfile,
    resumeDraft,
    outreachDraft,
    gapDraft,
    certDraft,
    keywordMap
  });

  for (let attempt = 0; attempt < MAX_ATTEMPTS && (qc.hard_fail || qc.confidence_total < getAutoShipThreshold()); attempt += 1) {
    if (qc.flags.some((flag) => flag.startsWith("resume_claim:"))) {
      resumeDraft = stripUnsupportedLines(resumeDraft, qc.flags);
    }

    if (qc.flags.some((flag) => flag.startsWith("jobs_insufficient") || flag.startsWith("job_invalid_url") || flag.startsWith("job_aggregator_url"))) {
      const pipelineResult = await runJobPipeline({
        candidate_id: input.orderId,
        order_id: input.orderId,
        resume_profile_json: input.resumeProfile,
        preferences: {
          ...input.preferences,
          preferred_titles: input.targetTitles
        },
        target_job_url: input.target_job_url ?? null,
        target_job_description: input.target_job_description ?? null,
        max_results: input.tier.limits.maxJobs * 2
      });
      jobs = pipelineResult.jobs;
      runId = pipelineResult.run_id;
    }

    if (qc.flags.includes("outreach_missing") || qc.flags.includes("outreach_cadence_missing")) {
      outreachDraft = await generateOutreach({
        fullName: input.fullName,
        targetTitles: input.targetTitles,
        companyList: jobs.map((job) => job.company_name)
      });
    }

    if (qc.flags.includes("certs_missing")) {
      const summary = `Target roles: ${input.targetTitles.join(", ")}.`;
      const regenerated = await generateCertsAndGaps({
        profileSummary: summary,
        targetTitles: input.targetTitles
      });
      gapDraft = regenerated.gaps;
      certDraft = regenerated.certs;
      keywordMap = Array.from(
        new Set([
          ...(input.resumeProfile.keywords ?? []),
          ...(input.resumeProfile.skills ?? []),
          ...(input.resumeProfile.tools ?? [])
        ])
      ).slice(0, 12);
    }

    qc = await runQC({
      orderId: input.orderId,
      tier: input.tier,
      jobs,
      resumeProfile: input.resumeProfile,
      resumeDraft,
      outreachDraft,
      gapDraft,
      certDraft,
      keywordMap
    });
  }

  return {
    qc,
    jobs,
    runId,
    resumeDraft,
    outreachDraft,
    gapDraft,
    certDraft,
    keywordMap
  };
}

function getAutoShipThreshold() {
  const parsed = Number(process.env.QC_AUTO_SHIP_THRESHOLD ?? "0.82");
  return Number.isFinite(parsed) ? parsed : 0.82;
}

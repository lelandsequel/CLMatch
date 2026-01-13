import type { ScoredJob } from "../jobs/types";
import type { Tier } from "../pricing";
import { fetchWithTimeout } from "../jobs/http";

export type QCInput = {
  orderId: string;
  tier: Tier;
  jobs: ScoredJob[];
  resumeProfile?: Record<string, unknown> | null;
  resumeDraft?: string;
  outreachDraft?: string;
  gapDraft?: string[];
  certDraft?: string[];
  keywordMap?: string[];
};

export type QCResult = {
  order_id: string;
  tier_id: string;
  qc_strictness: Tier["qcStrictness"];
  confidence_total: number;
  confidence_resume: number;
  confidence_jobs: number;
  confidence_outreach: number;
  confidence_certs: number;
  hard_fail: boolean;
  flags: string[];
  valid_jobs: ScoredJob[];
  invalid_jobs: ScoredJob[];
};

const ATS_ALLOWED = new Set(["greenhouse", "lever", "ashby", "workday"]);
const AGGREGATOR_HOSTS = [
  "indeed.com",
  "ziprecruiter.com",
  "monster.com",
  "glassdoor.com",
  "talent.com",
  "simplyhired.com",
  "linkedin.com",
  "careerbuilder.com"
];

const RESUME_FORBIDDEN = [
  "bachelor",
  "master",
  "phd",
  "mba",
  "certified",
  "certification",
  "university",
  "college",
  "degree",
  "cpa",
  "pmp",
  "scrum master"
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function isAggregatorUrl(url: string) {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    return AGGREGATOR_HOSTS.some((domain) => host.endsWith(domain));
  } catch {
    return true;
  }
}

async function checkUrl(url: string) {
  try {
    const response = await fetchWithTimeout(url, { method: "HEAD", timeoutMs: 5000 });
    if (response.status >= 200 && response.status < 400) return true;
    if (response.status === 405 || response.status === 403) {
      const fallback = await fetchWithTimeout(url, { method: "GET", timeoutMs: 7000 });
      return fallback.status >= 200 && fallback.status < 400;
    }
    return false;
  } catch {
    return false;
  }
}

function validateResumeProfile(profile?: Record<string, unknown> | null) {
  if (!profile || typeof profile !== "object") return false;
  const required = ["skills", "tools", "roles", "industries", "keywords", "locations", "achievements"];
  return required.every((key) => Array.isArray((profile as Record<string, unknown>)[key]));
}

function collectAllowedFacts(profile?: Record<string, unknown> | null) {
  if (!profile) return new Set<string>();
  const fields = ["skills", "tools", "roles", "industries", "keywords", "locations", "achievements"];
  const values = fields.flatMap((key) => {
    const list = (profile as Record<string, unknown>)[key];
    return Array.isArray(list) ? list : [];
  });
  return new Set(values.map((value) => String(value).toLowerCase()));
}

function findUnsupportedResumeLines(resumeDraft: string, allowedFacts: Set<string>) {
  const lines = resumeDraft.split("\n").map((line) => line.trim()).filter(Boolean);
  const unsupported: string[] = [];
  for (const line of lines) {
    const lowered = line.toLowerCase();
    const containsForbidden = RESUME_FORBIDDEN.some((token) => lowered.includes(token));
    if (!containsForbidden) continue;
    const hasAllowed = Array.from(allowedFacts).some((fact) => fact && lowered.includes(fact));
    if (!hasAllowed) unsupported.push(line);
  }
  return unsupported;
}

export async function runQC(input: QCInput): Promise<QCResult> {
  const flags: string[] = [];
  const requiredJobs = input.tier.limits.maxJobs;
  const isPremium = input.tier.requiresHumanQA;
  const fitThreshold = isPremium ? 62 : 55;
  const ghostThreshold = isPremium ? 70 : 80;

  const resumeProfileValid = validateResumeProfile(input.resumeProfile);
  if (!resumeProfileValid) {
    flags.push("resume_profile_invalid");
  }

  const resumeDraft = input.resumeDraft ?? "";
  const allowedFacts = collectAllowedFacts(input.resumeProfile);
  const unsupportedLines = resumeDraft
    ? findUnsupportedResumeLines(resumeDraft, allowedFacts)
    : [];
  if (unsupportedLines.length) {
    unsupportedLines.forEach((line) => flags.push(`resume_claim:${line}`));
  }

  const validJobs: ScoredJob[] = [];
  const invalidJobs: ScoredJob[] = [];
  let atsVerifiedCount = 0;
  let urlCheckedCount = 0;

  for (const job of input.jobs) {
    const applyUrl = job.apply_url ?? "";
    let valid = true;

    if (!applyUrl || !applyUrl.startsWith("https://")) {
      flags.push(`job_invalid_url:${job.company_name} - ${job.title}`);
      valid = false;
    } else if (isAggregatorUrl(applyUrl)) {
      flags.push(`job_aggregator_url:${job.company_name} - ${job.title}`);
      valid = false;
    } else {
      const urlOk = await checkUrl(applyUrl);
      urlCheckedCount += 1;
      if (!urlOk) {
        flags.push(`job_unreachable_url:${job.company_name} - ${job.title}`);
        valid = false;
      }
    }

    const atsType = job.ats_type ?? "unknown";
    if (ATS_ALLOWED.has(atsType)) {
      atsVerifiedCount += 1;
    } else {
      flags.push(`job_invalid_ats:${job.company_name} - ${job.title}`);
      if (isPremium) {
        valid = false;
      } else {
        job.ghost_risk_score = Math.max(job.ghost_risk_score, 85);
      }
    }

    if (job.fit_score < fitThreshold) {
      flags.push(`job_fit_below_threshold:${job.company_name} - ${job.title}`);
      if (isPremium) valid = false;
    }

    if (job.ghost_risk_score > ghostThreshold) {
      flags.push(`job_ghost_above_threshold:${job.company_name} - ${job.title}`);
      if (isPremium) valid = false;
    }

    if (valid) {
      validJobs.push(job);
    } else {
      invalidJobs.push(job);
    }
  }

  if (validJobs.length < requiredJobs) {
    flags.push(`jobs_insufficient:${validJobs.length}/${requiredJobs}`);
  }

  const outreachDraft = input.outreachDraft ?? "";
  const outreachRequired = input.tier.flags.includeOutreachKit;
  const outreachHasRecruiter = /Recruiter outreach/i.test(outreachDraft);
  const outreachHasCadence = /Cadence/i.test(outreachDraft);
  if (outreachRequired && !outreachHasRecruiter) {
    flags.push("outreach_missing");
  }
  if (outreachRequired && input.tier.flags.includeCadence && !outreachHasCadence) {
    flags.push("outreach_cadence_missing");
  }

  const gapDraft = input.gapDraft ?? [];
  const certDraft = input.certDraft ?? [];
  const certsRequired = input.tier.flags.includeCertPlan;
  if (certsRequired && (!gapDraft.length || !certDraft.length)) {
    flags.push("certs_missing");
  }

  const keywordMap = input.keywordMap ?? [];
  if (input.tier.flags.includeKeywordMap && !keywordMap.length) {
    flags.push("keyword_map_missing");
  }

  const resumeRequired = input.tier.flags.includeFullResumeRewrite || input.tier.flags.includeResumePatchNotes;
  if (resumeRequired && !resumeDraft) {
    flags.push("resume_missing");
  }

  const confidence_jobs = clamp(
    validJobs.length ? validJobs.length / requiredJobs : 0,
    0,
    1
  );
  const atsRatio = input.jobs.length ? atsVerifiedCount / input.jobs.length : 0;
  const confidence_jobs_weighted = clamp(confidence_jobs * 0.7 + atsRatio * 0.3);

  let confidence_resume = 1;
  if (resumeRequired) {
    confidence_resume = unsupportedLines.length ? 0.35 : resumeDraft ? 1 : 0.4;
  }

  let confidence_outreach = 1;
  if (outreachRequired) {
    confidence_outreach = outreachHasRecruiter ? (outreachHasCadence ? 1 : 0.7) : 0.3;
  }

  let confidence_certs = 1;
  if (certsRequired) {
    confidence_certs = gapDraft.length >= 2 && certDraft.length >= 2 ? 1 : 0.4;
  }

  const confidence_total = clamp(
    confidence_jobs_weighted * 0.45 +
      confidence_resume * 0.3 +
      confidence_outreach * 0.15 +
      confidence_certs * 0.1
  );

  const hard_fail =
    !resumeProfileValid ||
    (resumeRequired && (!resumeDraft || unsupportedLines.length > 0)) ||
    (outreachRequired && !outreachHasRecruiter) ||
    (certsRequired && (!gapDraft.length || !certDraft.length)) ||
    validJobs.length < requiredJobs;

  if (!urlCheckedCount) {
    flags.push("url_checks_skipped");
  }

  return {
    order_id: input.orderId,
    tier_id: input.tier.id,
    qc_strictness: input.tier.qcStrictness,
    confidence_total,
    confidence_resume,
    confidence_jobs: confidence_jobs_weighted,
    confidence_outreach,
    confidence_certs,
    hard_fail,
    flags,
    valid_jobs: validJobs.slice(0, requiredJobs),
    invalid_jobs: invalidJobs
  };
}

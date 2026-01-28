import type { JobPreferences, ResumeProfile, ScoredJob, NormalizedJob, RecommendedApplyPath } from "./types";
import { DELIVERABLE_KEYWORDS, EVERGREEN_PHRASES, TOOL_KEYWORDS, VAGUE_PHRASES } from "./constants";
import { classifyRoleFamily } from "./roleFamily";
import { clamp, normalizeText, tokenize, uniqueTokens } from "./utils";

const REMOTE_WORDS = ["remote", "hybrid", "onsite", "on-site", "work from home"];

function hasEvergreenLanguage(text: string) {
  const normalized = normalizeText(text);
  return EVERGREEN_PHRASES.some((phrase) => normalized.includes(normalizeText(phrase)));
}

function isRemoteClear(text: string) {
  const normalized = normalizeText(text);
  return REMOTE_WORDS.some((word) => normalized.includes(normalizeText(word)));
}

function isVague(text: string) {
  const normalized = normalizeText(text);
  const hits = VAGUE_PHRASES.filter((phrase) => normalized.includes(normalizeText(phrase)));
  return hits.length >= 2 || normalized.length < 200;
}

function hasSpecifics(text: string) {
  const normalized = normalizeText(text);
  const toolHit = TOOL_KEYWORDS.some((tool) => normalized.includes(normalizeText(tool)));
  const deliverableHit = DELIVERABLE_KEYWORDS.some((word) => normalized.includes(normalizeText(word)));
  return toolHit || deliverableHit;
}

function hasQuantifiedImpact(text: string) {
  return /\d+%|\$\d+|\d+x|\b\d{2,}\b/.test(text);
}

function inferSeniority(title: string) {
  const normalized = normalizeText(title);
  if (normalized.includes("intern")) return "intern";
  if (normalized.includes("junior") || normalized.includes("associate")) return "junior";
  if (normalized.includes("senior") || normalized.includes("sr")) return "senior";
  if (normalized.includes("lead") || normalized.includes("principal")) return "lead";
  if (normalized.includes("manager")) return "manager";
  if (normalized.includes("director")) return "director";
  if (normalized.includes("vp") || normalized.includes("vice president")) return "vp";
  if (normalized.includes("head") || normalized.includes("chief")) return "chief";
  return "mid";
}

function seniorityMatch(candidate: string, job: string) {
  const normalizedCandidate = normalizeText(candidate);
  const normalizedJob = normalizeText(job);
  if (normalizedCandidate === normalizedJob) return 1;
  if (normalizedCandidate.includes("director") && normalizedJob.includes("manager")) return 0.6;
  if (normalizedCandidate.includes("manager") && normalizedJob.includes("lead")) return 0.6;
  if (normalizedCandidate.includes("senior") && normalizedJob.includes("mid")) return 0.6;
  return 0.4;
}

function titleSimilarity(preferredTitles: string[], title: string) {
  const normalizedTitle = normalizeText(title);
  for (const preferred of preferredTitles) {
    const normalizedPreferred = normalizeText(preferred);
    if (!normalizedPreferred) continue;
    if (normalizedTitle.includes(normalizedPreferred)) {
      return { score: 1, reason: `Title aligns with preferred "${preferred}"` };
    }
  }
  const family = classifyRoleFamily(title);
  if (family !== "Other" && preferredTitles.length > 0) {
    return { score: 0.7, reason: `Role family match: ${family}` };
  }
  return { score: 0.3, reason: "Title loosely aligned" };
}

function industryMatch(prefer: string[], avoid: string[], description: string) {
  const normalized = normalizeText(description);
  const avoidHit = avoid.find((term) => normalized.includes(normalizeText(term)));
  if (avoidHit) {
    return { score: 0, reason: `Industry avoid hit: ${avoidHit}` };
  }
  const preferHit = prefer.find((term) => normalized.includes(normalizeText(term)));
  if (preferHit) {
    return { score: 1, reason: `Industry preference matched: ${preferHit}` };
  }
  return { score: 0.5, reason: "Industry unknown" };
}

function achievementAlignment(description: string, achievements?: string[]) {
  const jobHas = hasQuantifiedImpact(description);
  const resumeHas = (achievements ?? []).some(hasQuantifiedImpact);
  if (jobHas && resumeHas) return { score: 1, reason: "Quantified impact language aligned" };
  if (jobHas || resumeHas) return { score: 0.6, reason: "Some quantified impact signals" };
  return { score: 0.3, reason: "Low quantified impact signals" };
}

function keywordMatch(profileTokens: string[], jobTokens: string[]) {
  const jobSet = new Set(jobTokens);
  const matched = profileTokens.filter((token) => jobSet.has(token));
  const ratio = matched.length / Math.max(1, profileTokens.length);
  return { ratio, matched };
}

export function computeFitScore(job: NormalizedJob, profile: ResumeProfile, prefs: JobPreferences) {
  const reasons: string[] = [];
  const jobText = `${job.title} ${job.description ?? ""}`.trim();
  const profileTokens = uniqueTokens([
    ...profile.skills,
    ...profile.tools,
    ...profile.roles,
    ...profile.keywords
  ].map((item) => normalizeText(item)).filter(Boolean));
  const jobTokens = tokenize(jobText);
  const { ratio, matched } = keywordMatch(profileTokens, jobTokens);
  const keywordScore = ratio * 40;
  if (matched.length) {
    reasons.push(`Matched skills/tools: ${matched.slice(0, 5).join(", ")}`);
  }

  const titleResult = titleSimilarity(prefs.preferred_titles, job.title);
  const titleScore = titleResult.score * 20;
  if (titleResult.reason) reasons.push(titleResult.reason);

  const jobSeniority = inferSeniority(job.title);
  const seniorityScore = seniorityMatch(profile.seniority, jobSeniority) * 15;
  reasons.push(`Seniority signal: ${jobSeniority}`);

  const industryResult = industryMatch(prefs.industries_prefer, prefs.industries_avoid, jobText);
  const industryScore = industryResult.score * 15;
  reasons.push(industryResult.reason);

  const achievementResult = achievementAlignment(jobText, profile.achievements);
  const achievementScore = achievementResult.score * 10;
  reasons.push(achievementResult.reason);

  const total = keywordScore + titleScore + seniorityScore + industryScore + achievementScore;

  return { score: clamp(Math.round(total)), reasons };
}

export function computeGhostRisk(job: NormalizedJob) {
  const reasons: string[] = [];
  let score = 0;
  const description = job.description ?? "";

  if (job.ats_type === "unknown") {
    score += 30;
    reasons.push("Not ATS-verified / aggregator link");
  }

  if (hasEvergreenLanguage(description)) {
    score += 25;
    reasons.push("Evergreen language detected");
  }

  if (!job.posted_at) {
    score += 15;
    reasons.push("Posted date missing");
  }

  const locationText = `${job.location ?? ""} ${description}`.trim();
  if (!isRemoteClear(locationText)) {
    score += 10;
    reasons.push("Remote/onsite status unclear");
  }

  if (isVague(description)) {
    score += 10;
    reasons.push("Vague responsibilities detected");
  }

  if (job.posted_at && job.ats_type !== "unknown") {
    const postedDate = new Date(job.posted_at);
    const days = (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 14) {
      score -= 20;
      reasons.push("Fresh ATS posting (<=14 days)");
    }
  }

  if (hasSpecifics(description)) {
    score -= 10;
    reasons.push("Clear deliverables/tools/team details");
  }

  if (isRemoteClear(locationText)) {
    score -= 10;
    reasons.push("Location/remote clearly stated");
  }

  return { score: clamp(score), reasons };
}

export function recommendApplyPath(job: NormalizedJob, fitScore: number, ghostScore: number): RecommendedApplyPath {
  if (ghostScore >= 70) return "Referral";
  if (fitScore >= 75 && ghostScore <= 35) return "ATS";
  if (ghostScore >= 50) return "Recruiter";
  return "Both";
}

export function scoreJob(job: NormalizedJob, profile: ResumeProfile, prefs: JobPreferences, summary: string): ScoredJob {
  const fit = computeFitScore(job, profile, prefs);
  const ghost = computeGhostRisk(job);
  const recommended_apply_path = recommendApplyPath(job, fit.score, ghost.score);

  return {
    ...job,
    fit_score: fit.score,
    ghost_risk_score: ghost.score,
    reasons_fit: fit.reasons,
    reasons_ghost: ghost.reasons,
    recommended_apply_path,
    short_summary: summary
  };
}

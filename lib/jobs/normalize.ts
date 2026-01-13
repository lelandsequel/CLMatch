import type { AtsType, NormalizedJob, ParsedJob } from "./types";
import { ATS_PATTERNS } from "./constants";
import { hashKey, normalizeText } from "./utils";

export function detectAtsType(url: string): AtsType {
  for (const entry of ATS_PATTERNS) {
    if (entry.pattern.test(url)) {
      return entry.type;
    }
  }
  return "unknown";
}

export function canonicalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

export function normalizeCompany(name: string) {
  return normalizeText(name)
    .replace(/\b(inc|llc|ltd|corp|co)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTitle(title: string) {
  return normalizeText(title)
    .replace(/\b(remote|hybrid|onsite)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildDedupeKey(company: string, title: string, applyUrl: string) {
  const normalized = `${company}|${title}|${applyUrl}`;
  return hashKey(normalized);
}

export function normalizeParsedJob(job: ParsedJob): NormalizedJob {
  const atsType = job.ats_type ?? detectAtsType(job.source_url);
  const company = normalizeCompany(job.company_name);
  const title = normalizeTitle(job.title);
  const applyUrl = job.apply_url || job.source_url;
  const canonicalApply = canonicalizeUrl(applyUrl);

  return {
    ...job,
    apply_url: applyUrl,
    ats_type: atsType,
    normalized_company: company,
    normalized_title: title,
    canonical_apply_url: canonicalApply,
    dedupe_key: buildDedupeKey(company, title, canonicalApply)
  };
}

export function normalizeParsedJobs(jobs: ParsedJob[]) {
  return jobs.map(normalizeParsedJob);
}

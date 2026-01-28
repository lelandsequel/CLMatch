export type AtsType = "greenhouse" | "lever" | "ashby" | "workday" | "unknown";

export type RecommendedApplyPath = "ATS" | "Recruiter" | "Referral" | "Both";

export interface ResumeProfile {
  skills: string[];
  tools: string[];
  roles: string[];
  seniority: string;
  industries: string[];
  keywords: string[];
  locations: string[];
  achievements?: string[];
}

export interface JobPreferences {
  remote_only: boolean;
  contract_ok: boolean;
  preferred_titles: string[];
  industries_prefer: string[];
  industries_avoid: string[];
  salary_min?: number;
  geo?: string;
}

export interface DiscoveredUrl {
  url: string;
  source: string;
}

export interface ParsedJob {
  title: string;
  company_name: string;
  location?: string | null;
  is_remote?: boolean | null;
  posted_at?: string | null;
  description?: string | null;
  apply_url?: string | null;
  source_url: string;
  ats_type: AtsType;
}

export interface NormalizedJob extends ParsedJob {
  apply_url: string;
  source_url: string;
  normalized_company: string;
  normalized_title: string;
  canonical_apply_url: string;
  dedupe_key: string;
}

export interface ScoredJob extends NormalizedJob {
  fit_score: number;
  ghost_risk_score: number;
  reasons_fit: string[];
  reasons_ghost: string[];
  recommended_apply_path: RecommendedApplyPath;
  short_summary: string;
}

export interface PipelineInput {
  candidate_id: string;
  order_id?: string | null;
  resume_profile_json: ResumeProfile;
  preferences: JobPreferences;
  target_job_description?: string | null;
  target_job_url?: string | null;
  max_results?: number;
}

export interface PipelineResult {
  run_id: string;
  jobs: ScoredJob[];
  stats: {
    discovered: number;
    fetched: number;
    parsed: number;
    deduped: number;
    scored: number;
  };
}

export interface JobSourceRecord {
  url: string;
  ats_type: AtsType;
  http_status?: number | null;
  fetched_at: string;
  raw_html?: string | null;
  error?: string | null;
}

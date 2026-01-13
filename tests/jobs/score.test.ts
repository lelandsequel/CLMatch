import { describe, expect, it } from "vitest";
import { computeFitScore, computeGhostRisk } from "../../lib/jobs/score";
import type { NormalizedJob, JobPreferences, ResumeProfile } from "../../lib/jobs/types";

const profile: ResumeProfile = {
  skills: ["SQL", "Tableau", "Salesforce"],
  tools: ["Excel", "Snowflake"],
  roles: ["RevOps Manager"],
  seniority: "manager",
  industries: ["SaaS"],
  keywords: ["pipeline", "forecasting"],
  locations: ["Remote"],
  achievements: ["Drove 20% ARR growth"]
};

const prefs: JobPreferences = {
  remote_only: true,
  contract_ok: false,
  preferred_titles: ["RevOps Manager", "Sales Operations Manager"],
  industries_prefer: ["SaaS"],
  industries_avoid: ["Retail"],
  salary_min: 120000,
  geo: "US"
};

const job: NormalizedJob = {
  title: "RevOps Manager",
  company_name: "Acme",
  location: "Remote - US",
  is_remote: true,
  posted_at: new Date().toISOString(),
  description: "Own forecasting, pipeline analytics, and Salesforce reporting. Build dashboards in Tableau."
    + " Partner with sales leadership. 20% YoY targets.",
  apply_url: "https://jobs.lever.co/acme/123",
  source_url: "https://jobs.lever.co/acme/123",
  ats_type: "lever",
  normalized_company: "acme",
  normalized_title: "revops manager",
  canonical_apply_url: "https://jobs.lever.co/acme/123",
  dedupe_key: "abc"
};

describe("scoring", () => {
  it("computes fit score with reasons", () => {
    const { score, reasons } = computeFitScore(job, profile, prefs);
    expect(score).toBeGreaterThan(60);
    expect(reasons.length).toBeGreaterThan(0);
  });

  it("computes ghost risk score", () => {
    const { score, reasons } = computeGhostRisk(job);
    expect(score).toBeLessThan(60);
    expect(reasons.length).toBeGreaterThan(0);
  });
});

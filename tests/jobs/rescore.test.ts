import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { ScoredJob, ResumeProfile, JobPreferences } from "../../lib/jobs/types";

// --- Fixtures ---

const profile: ResumeProfile = {
  skills: ["SQL", "Tableau", "Salesforce"],
  tools: ["Excel", "Snowflake"],
  roles: ["RevOps Manager"],
  seniority: "manager",
  industries: ["SaaS"],
  keywords: ["pipeline", "forecasting"],
  locations: ["Remote"],
  achievements: ["Drove 20% ARR growth"],
};

const prefs: JobPreferences = {
  remote_only: true,
  contract_ok: false,
  preferred_titles: ["RevOps Manager", "Sales Operations Manager"],
  industries_prefer: ["SaaS"],
  industries_avoid: ["Retail"],
  salary_min: 120000,
  geo: "US",
};

function makeJob(overrides: Partial<ScoredJob> = {}): ScoredJob {
  return {
    title: "RevOps Manager",
    company_name: "Acme",
    location: "Remote - US",
    is_remote: true,
    posted_at: new Date().toISOString(),
    description: "Own forecasting, pipeline analytics, and Salesforce reporting.",
    apply_url: "https://jobs.lever.co/acme/123",
    source_url: "https://jobs.lever.co/acme/123",
    ats_type: "lever",
    normalized_company: "acme",
    normalized_title: "revops manager",
    canonical_apply_url: "https://jobs.lever.co/acme/123",
    dedupe_key: "job-acme-1",
    fit_score: 70,
    ghost_risk_score: 20,
    reasons_fit: ["Salesforce match"],
    reasons_ghost: [],
    recommended_apply_path: "ATS",
    short_summary: "RevOps role at Acme.",
    ...overrides,
  };
}

const jobA = makeJob({ dedupe_key: "job-a", fit_score: 70 });
const jobB = makeJob({ dedupe_key: "job-b", fit_score: 50, title: "Sales Ops Manager", company_name: "Beta" });
const jobC = makeJob({ dedupe_key: "job-c", fit_score: 60, title: "Operations Analyst", company_name: "Gamma" });

// --- Tests ---

describe("rescore module", () => {
  describe("semanticRescore — with ShipMachine configured", () => {
    beforeEach(() => {
      process.env.SHIPMACHINE_ENDPOINT = "https://api.shipmachine.dev";
      process.env.SHIPMACHINE_API_KEY = "test-key";
    });

    afterEach(() => {
      delete process.env.SHIPMACHINE_ENDPOINT;
      delete process.env.SHIPMACHINE_API_KEY;
      vi.restoreAllMocks();
    });

    it("returns a map keyed by job_id with semantic scores", async () => {
      // Mock fetch at the module level
      const mockResponse = [
        { job_id: "job-a", semantic_fit_score: 90, semantic_reasons: ["Strong Salesforce match"], combined_score: 82 },
        { job_id: "job-b", semantic_fit_score: 75, semantic_reasons: ["Partial match"], combined_score: 65 },
      ];

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: mockResponse }),
      }));

      const { semanticRescore } = await import("../../lib/jobs/rescore");
      const result = await semanticRescore([jobA, jobB, jobC], profile, prefs);

      expect(result).toBeInstanceOf(Map);
      expect(result.has("job-a")).toBe(true);
      expect(result.has("job-b")).toBe(true);
      expect(result.get("job-a")?.semantic_fit_score).toBe(90);
      expect(result.get("job-a")?.combined_score).toBe(82);
      expect(result.get("job-b")?.semantic_reasons).toContain("Partial match");
    });

    it("returns empty map when jobs array is empty", async () => {
      vi.stubGlobal("fetch", vi.fn());

      const { semanticRescore } = await import("../../lib/jobs/rescore");
      const result = await semanticRescore([], profile, prefs);

      expect(result.size).toBe(0);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("returns empty map when PromptSpec call returns non-array", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: { error: "unexpected" } }),
      }));

      const { semanticRescore } = await import("../../lib/jobs/rescore");
      const result = await semanticRescore([jobA], profile, prefs);

      expect(result.size).toBe(0);
    });

    it("returns empty map when fetch fails (non-ok status)", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }));

      const { semanticRescore } = await import("../../lib/jobs/rescore");
      const result = await semanticRescore([jobA, jobB], profile, prefs);

      expect(result.size).toBe(0);
    });
  });

  describe("semanticRescore — graceful fallback (no ShipMachine)", () => {
    beforeEach(() => {
      delete process.env.SHIPMACHINE_ENDPOINT;
      delete process.env.PROMPTOS_ENDPOINT;
      delete process.env.SHIPMACHINE_API_KEY;
      delete process.env.PROMPTOS_API_KEY;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns empty map without calling fetch", async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      const { semanticRescore } = await import("../../lib/jobs/rescore");
      const result = await semanticRescore([jobA, jobB, jobC], profile, prefs);

      expect(result.size).toBe(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("augmentJobs — sorted by combined_score", () => {
    beforeEach(() => {
      process.env.SHIPMACHINE_ENDPOINT = "https://api.shipmachine.dev";
      process.env.SHIPMACHINE_API_KEY = "test-key";
    });

    afterEach(() => {
      delete process.env.SHIPMACHINE_ENDPOINT;
      delete process.env.SHIPMACHINE_API_KEY;
      vi.restoreAllMocks();
    });

    it("sorts augmented jobs by combined_score descending", async () => {
      // jobC gets higher semantic score than jobA despite lower keyword score
      const mockResponse = [
        { job_id: "job-a", semantic_fit_score: 60, semantic_reasons: ["OK match"], combined_score: 62 },
        { job_id: "job-b", semantic_fit_score: 70, semantic_reasons: ["Decent match"], combined_score: 68 },
        { job_id: "job-c", semantic_fit_score: 95, semantic_reasons: ["Excellent domain fit"], combined_score: 89 },
      ];

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: mockResponse }),
      }));

      const { augmentJobs } = await import("../../lib/jobs/rescore");
      const result = await augmentJobs([jobA, jobB, jobC], profile, prefs);

      expect(result[0].dedupe_key).toBe("job-c");
      expect(result[0].combined_score).toBe(89);
      expect(result[1].dedupe_key).toBe("job-b");
      expect(result[1].combined_score).toBe(68);
      expect(result[2].dedupe_key).toBe("job-a");
      expect(result[2].combined_score).toBe(62);
    });

    it("sets augmented_at timestamp on all jobs", async () => {
      const mockResponse = [
        { job_id: "job-a", semantic_fit_score: 80, semantic_reasons: [], combined_score: 76 },
      ];

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: mockResponse }),
      }));

      const { augmentJobs } = await import("../../lib/jobs/rescore");
      const result = await augmentJobs([jobA, jobB], profile, prefs);

      for (const job of result) {
        expect(job.augmented_at).toBeDefined();
        expect(new Date(job.augmented_at!).getTime()).toBeLessThanOrEqual(Date.now());
      }
    });

    it("preserves semantic_reasons on augmented jobs", async () => {
      const reasons = ["Salesforce expertise aligns with JD", "SaaS industry match"];
      const mockResponse = [
        { job_id: "job-a", semantic_fit_score: 85, semantic_reasons: reasons, combined_score: 79 },
      ];

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: mockResponse }),
      }));

      const { augmentJobs } = await import("../../lib/jobs/rescore");
      const result = await augmentJobs([jobA], profile, prefs);

      const augmented = result.find((j) => j.dedupe_key === "job-a");
      expect(augmented?.semantic_reasons).toEqual(reasons);
    });
  });

  describe("augmentJobs — graceful fallback (no ShipMachine)", () => {
    beforeEach(() => {
      delete process.env.SHIPMACHINE_ENDPOINT;
      delete process.env.PROMPTOS_ENDPOINT;
      delete process.env.SHIPMACHINE_API_KEY;
      delete process.env.PROMPTOS_API_KEY;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("falls back to original keyword fit_score as combined_score", async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      const { augmentJobs } = await import("../../lib/jobs/rescore");
      const result = await augmentJobs([jobA, jobB, jobC], profile, prefs);

      // All jobs should have combined_score equal to their original fit_score
      for (const job of result) {
        const original = [jobA, jobB, jobC].find((j) => j.dedupe_key === job.dedupe_key)!;
        expect(job.combined_score).toBe(original.fit_score);
      }

      // No fetch calls
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("sorts by fit_score when no augmentation available", async () => {
      vi.stubGlobal("fetch", vi.fn());

      const { augmentJobs } = await import("../../lib/jobs/rescore");
      // jobA=70, jobC=60, jobB=50
      const result = await augmentJobs([jobB, jobC, jobA], profile, prefs);

      expect(result[0].dedupe_key).toBe("job-a");
      expect(result[1].dedupe_key).toBe("job-c");
      expect(result[2].dedupe_key).toBe("job-b");
    });

    it("does not set semantic_fit_score when fallback", async () => {
      vi.stubGlobal("fetch", vi.fn());

      const { augmentJobs } = await import("../../lib/jobs/rescore");
      const result = await augmentJobs([jobA], profile, prefs);

      expect(result[0].semantic_fit_score).toBeUndefined();
      expect(result[0].semantic_reasons).toBeUndefined();
    });
  });

  describe("callPromptSpec", () => {
    afterEach(() => {
      delete process.env.SHIPMACHINE_ENDPOINT;
      delete process.env.PROMPTOS_ENDPOINT;
      delete process.env.SHIPMACHINE_API_KEY;
      delete process.env.PROMPTOS_API_KEY;
      vi.restoreAllMocks();
    });

    it("returns null when no endpoint configured", async () => {
      vi.stubGlobal("fetch", vi.fn());

      const { callPromptSpec } = await import("../../lib/jobs/rescore");
      const result = await callPromptSpec("clmatch.semantic_rescore", { resume_text: "test" });

      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it("uses PROMPTOS_ENDPOINT as fallback endpoint name", async () => {
      process.env.PROMPTOS_ENDPOINT = "https://api.promptos.dev";
      process.env.PROMPTOS_API_KEY = "promptos-key";

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: [] }),
      }));

      const { callPromptSpec } = await import("../../lib/jobs/rescore");
      await callPromptSpec("clmatch.jd_gap_analysis", { resume_text: "test" });

      expect(fetch).toHaveBeenCalledWith(
        "https://api.promptos.dev/execute",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Authorization": "Bearer promptos-key",
          }),
        })
      );
    });

    it("returns data.output when present", async () => {
      process.env.SHIPMACHINE_ENDPOINT = "https://api.shipmachine.dev";
      process.env.SHIPMACHINE_API_KEY = "test-key";

      const expectedOutput = [{ job_id: "x", semantic_fit_score: 80 }];

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: expectedOutput, raw: "ignored" }),
      }));

      const { callPromptSpec } = await import("../../lib/jobs/rescore");
      const result = await callPromptSpec("clmatch.semantic_rescore", {});

      expect(result).toEqual(expectedOutput);
    });
  });
});

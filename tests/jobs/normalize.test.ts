import { describe, expect, it } from "vitest";
import { detectAtsType, normalizeParsedJob } from "../../lib/jobs/normalize";

describe("normalize", () => {
  it("detects ATS type", () => {
    expect(detectAtsType("https://job-boards.greenhouse.io/acme")).toBe("greenhouse");
    expect(detectAtsType("https://jobs.lever.co/acme" )).toBe("lever");
    expect(detectAtsType("https://jobs.ashbyhq.com/acme" )).toBe("ashby");
    expect(detectAtsType("https://acme.myworkdayjobs.com/en-US/Careers/" )).toBe("workday");
  });

  it("builds dedupe key", () => {
    const normalized = normalizeParsedJob({
      title: "RevOps Manager",
      company_name: "ACME Inc.",
      source_url: "https://jobs.lever.co/acme/123",
      ats_type: "lever"
    });
    expect(normalized.dedupe_key).toBeTruthy();
    expect(normalized.normalized_company).toBe("acme");
  });
});

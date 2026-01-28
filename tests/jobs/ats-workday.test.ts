import { describe, expect, it } from "vitest";
import { parseWorkday } from "../../lib/jobs/ats/workday";

describe("Workday parser", () => {
  it("parses JSON-LD", () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {"@type":"JobPosting","title":"FP&A Manager","datePosted":"2024-07-02","hiringOrganization":{"name":"Acme"},"description":"Own planning","jobLocation":{"address":{"addressLocality":"Remote"}}}
          </script>
        </head>
        <body></body>
      </html>
    `;
    const jobs = parseWorkday(html, "https://acme.myworkdayjobs.com/en-US/Careers/job/123");
    expect(jobs.length).toBe(1);
    expect(jobs[0].title).toBe("FP&A Manager");
    expect(jobs[0].ats_type).toBe("workday");
  });
});

import { describe, expect, it } from "vitest";
import { parseAshby } from "../../lib/jobs/ats/ashby";

describe("Ashby parser", () => {
  it("parses __NEXT_DATA__ jobPostings", () => {
    const html = `
      <html>
        <body>
          <script id="__NEXT_DATA__" type="application/json">
            {"props":{"pageProps":{"jobPostings":[{"id":"123","title":"BizOps Analyst","location":"Remote","publishedAt":"2024-07-01","description":"Build dashboards"}]}}}
          </script>
        </body>
      </html>
    `;
    const jobs = parseAshby(html, "https://jobs.ashbyhq.com/acme");
    expect(jobs.length).toBe(1);
    expect(jobs[0].title).toBe("BizOps Analyst");
    expect(jobs[0].ats_type).toBe("ashby");
  });
});

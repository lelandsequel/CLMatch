import { describe, expect, it } from "vitest";
import { parseGreenhouse } from "../../lib/jobs/ats/greenhouse";

describe("Greenhouse parser", () => {
  it("parses listing page", () => {
    const html = `
      <html>
        <head><title>Jobs at Acme</title></head>
        <body>
          <div class="opening">
            <a href="https://job-boards.greenhouse.io/acme/jobs/123">RevOps Manager</a>
            <span class="location">Remote</span>
          </div>
        </body>
      </html>
    `;
    const jobs = parseGreenhouse(html, "https://job-boards.greenhouse.io/acme");
    expect(jobs.length).toBe(1);
    expect(jobs[0].title).toBe("RevOps Manager");
    expect(jobs[0].ats_type).toBe("greenhouse");
  });
});

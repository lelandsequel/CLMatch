import { describe, expect, it } from "vitest";
import { parseLever } from "../../lib/jobs/ats/lever";

describe("Lever parser", () => {
  it("parses listing page", () => {
    const html = `
      <html>
        <head><title>Jobs at Acme</title></head>
        <body>
          <div class="posting">
            <a class="posting-title" href="https://jobs.lever.co/acme/123">Sales Ops Manager</a>
            <div class="posting-categories">
              <span class="location">Remote</span>
            </div>
          </div>
        </body>
      </html>
    `;
    const jobs = parseLever(html, "https://jobs.lever.co/acme");
    expect(jobs.length).toBe(1);
    expect(jobs[0].title).toBe("Sales Ops Manager");
    expect(jobs[0].ats_type).toBe("lever");
  });
});

import type { ParsedJob } from "../types";
import { cleanText, extractJsonLd, loadHtml } from "./shared";

function extractCompanyFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return cleanText(parts[0] ?? "Unknown");
  } catch {
    return "Unknown";
  }
}

type AshbyJob = {
  id?: string;
  jobId?: string;
  slug?: string;
  title?: string;
  location?: string;
  locationName?: string;
  publishedAt?: string;
  descriptionHtml?: string;
  description?: string;
  companyName?: string;
};

function findJobPostings(obj: unknown): AshbyJob[] {
  if (!obj || typeof obj !== "object") return [];
  if (Array.isArray(obj)) {
    return obj.flatMap(findJobPostings);
  }

  const record = obj as Record<string, unknown>;
  if (Array.isArray(record.jobPostings)) return record.jobPostings as AshbyJob[];
  if (Array.isArray(record.jobs)) return record.jobs as AshbyJob[];
  return Object.values(record).flatMap(findJobPostings);
}

export function parseAshby(html: string, sourceUrl: string): ParsedJob[] {
  const jsonLd = extractJsonLd(html);
  if (jsonLd) {
    return [
      {
        title: cleanText(jsonLd.title),
        company_name: cleanText(jsonLd.hiringOrganization?.name) || extractCompanyFromUrl(sourceUrl),
        location: cleanText(jsonLd.jobLocation?.address?.addressLocality || ""),
        is_remote: /remote/i.test(cleanText(jsonLd.jobLocationType)),
        posted_at: jsonLd.datePosted ?? null,
        description: cleanText(jsonLd.description),
        apply_url: jsonLd.url || sourceUrl,
        source_url: sourceUrl,
        ats_type: "ashby"
      }
    ];
  }

  const $ = loadHtml(html);
  const nextData = $("#__NEXT_DATA__").text();
  if (nextData) {
    try {
      const parsed = JSON.parse(nextData);
      const jobPostings = findJobPostings(parsed);
      if (jobPostings.length) {
        return jobPostings.map((job) => {
          const jobId = job.id || job.jobId || job.slug;
          const company = job.companyName || extractCompanyFromUrl(sourceUrl);
          const applyUrl = jobId
            ? `https://jobs.ashbyhq.com/${extractCompanyFromUrl(sourceUrl)}/${jobId}`
            : sourceUrl;
          return {
            title: cleanText(job.title),
            company_name: cleanText(company),
            location: cleanText(job.location || job.locationName || ""),
            is_remote: /remote/i.test(cleanText(job.location || "")),
            posted_at: job.publishedAt ?? null,
            description: cleanText(job.descriptionHtml || job.description || ""),
            apply_url: applyUrl,
            source_url: applyUrl,
            ats_type: "ashby"
          } as ParsedJob;
        });
      }
    } catch {
      // Ignore invalid JSON.
    }
  }

  const title = cleanText($("h1").first().text());
  if (!title) return [];
  const description = cleanText($(".job-description").text() || $("main").text());
  return [
    {
      title,
      company_name: extractCompanyFromUrl(sourceUrl),
      location: null,
      is_remote: /remote/i.test(description),
      posted_at: null,
      description,
      apply_url: sourceUrl,
      source_url: sourceUrl,
      ats_type: "ashby"
    }
  ];
}

import type { ParsedJob } from "../types";
import { cleanText, extractJsonLd, loadHtml } from "./shared";

function extractCompanyFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    return cleanText(parsed.hostname.split(".")[0] ?? "Unknown");
  } catch {
    return "Unknown";
  }
}

export function parseWorkday(html: string, sourceUrl: string): ParsedJob[] {
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
        ats_type: "workday"
      }
    ];
  }

  const $ = loadHtml(html);
  const title = cleanText($("h2[data-automation-id='jobPostingHeader']").text() || $("h1").first().text());
  if (!title) return [];
  const company = extractCompanyFromUrl(sourceUrl);
  const location = cleanText($("div[data-automation-id='locations']").text());
  const description = cleanText($("div[data-automation-id='jobPostingDescription']").text() || $("main").text());

  return [
    {
      title,
      company_name: company,
      location: location || null,
      is_remote: /remote/i.test(`${location} ${description}`),
      posted_at: null,
      description,
      apply_url: sourceUrl,
      source_url: sourceUrl,
      ats_type: "workday"
    }
  ];
}

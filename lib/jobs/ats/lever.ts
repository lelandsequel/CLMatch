import type { ParsedJob } from "../types";
import { cleanText, extractJsonLd, loadHtml } from "./shared";

function extractCompany($: ReturnType<typeof loadHtml>) {
  const meta = $("meta[property='og:site_name']").attr("content");
  if (meta) return cleanText(meta);
  const title = $("title").text();
  const match = title.match(/Jobs at\s+(.*)$/i);
  if (match) return cleanText(match[1]);
  return cleanText($(".main-header").text());
}

export function parseLever(html: string, sourceUrl: string): ParsedJob[] {
  const $ = loadHtml(html);
  const postings = $(".posting").toArray();
  const company = extractCompany($) || "Unknown";

  if (postings.length) {
    return postings
      .map((posting) => {
        const title = cleanText($(posting).find(".posting-title").text());
        const href = $(posting).find(".posting-title").attr("href") || sourceUrl;
        const location = cleanText($(posting).find(".posting-categories .location").text());
        if (!title) return null;
        return {
          title,
          company_name: company,
          location: location || null,
          is_remote: /remote/i.test(location),
          posted_at: null,
          description: null,
          apply_url: href,
          source_url: href,
          ats_type: "lever"
        } as ParsedJob;
      })
      .filter(Boolean) as ParsedJob[];
  }

  const jsonLd = extractJsonLd(html);
  if (jsonLd) {
    return [
      {
        title: cleanText(jsonLd.title),
        company_name: cleanText(jsonLd.hiringOrganization?.name) || company,
        location: cleanText(jsonLd.jobLocation?.address?.addressLocality || ""),
        is_remote: /remote/i.test(cleanText(jsonLd.jobLocationType)),
        posted_at: jsonLd.datePosted ?? null,
        description: cleanText(jsonLd.description),
        apply_url: jsonLd.url || sourceUrl,
        source_url: sourceUrl,
        ats_type: "lever"
      }
    ];
  }

  const title = cleanText($("h2").first().text());
  const description = cleanText($(".section").text());
  return title
    ? [
        {
          title,
          company_name: company,
          location: null,
          is_remote: /remote/i.test(description),
          posted_at: null,
          description,
          apply_url: sourceUrl,
          source_url: sourceUrl,
          ats_type: "lever"
        }
      ]
    : [];
}

import type { ParsedJob } from "../types";
import { cleanText, loadHtml, extractJsonLd } from "./shared";

function extractCompany($: ReturnType<typeof loadHtml>) {
  const meta = $("meta[property='og:site_name']").attr("content");
  if (meta) return cleanText(meta);
  const title = $("title").text();
  const match = title.match(/at\s+(.*)$/i);
  if (match) return cleanText(match[1]);
  return cleanText($("h1").first().text());
}

function extractPostedAt($: ReturnType<typeof loadHtml>) {
  const published = $("meta[property='article:published_time']").attr("content");
  if (published) return published;
  const time = $("time").attr("datetime");
  return time ?? null;
}

export function parseGreenhouse(html: string, sourceUrl: string): ParsedJob[] {
  const $ = loadHtml(html);
  const openings = $(".opening").toArray();
  const company = extractCompany($) || "Unknown";

  if (openings.length) {
    return openings
      .map((opening) => {
        const title = cleanText($(opening).find("a").first().text());
        const href = $(opening).find("a").attr("href") || sourceUrl;
        const location = cleanText($(opening).find(".location").text());
        if (!title) return null;
        return {
          title,
          company_name: company,
          location: location || null,
          is_remote: /remote/i.test(location),
          posted_at: extractPostedAt($),
          description: null,
          apply_url: href,
          source_url: href,
          ats_type: "greenhouse"
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
        ats_type: "greenhouse"
      }
    ];
  }

  const title = cleanText($("h1").first().text());
  const description = cleanText($("#content").text() || $(".content").text());
  return title
    ? [
        {
          title,
          company_name: company,
          location: null,
          is_remote: /remote/i.test(description),
          posted_at: extractPostedAt($),
          description,
          apply_url: sourceUrl,
          source_url: sourceUrl,
          ats_type: "greenhouse"
        }
      ]
    : [];
}

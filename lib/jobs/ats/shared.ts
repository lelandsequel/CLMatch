import * as cheerio from "cheerio";

export function loadHtml(html: string) {
  return cheerio.load(html);
}

export function extractJsonLd(html: string) {
  const $ = loadHtml(html);
  const scripts = $("script[type='application/ld+json']").toArray();
  for (const script of scripts) {
    const text = $(script).text();
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const jobPosting = parsed.find((entry) => entry["@type"] === "JobPosting");
        if (jobPosting) return jobPosting;
      }
      if (parsed["@type"] === "JobPosting") return parsed;
    } catch {
      // Ignore invalid JSON.
    }
  }
  return null;
}

export function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function parseLocation(value?: string | null) {
  const text = cleanText(value);
  return text || null;
}

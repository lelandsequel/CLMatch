import type { DiscoveredUrl, JobPreferences } from "./types";
import { ATS_PATTERNS } from "./constants";
import { DEFAULT_JOB_SEED_URLS } from "./seeds";
import { fetchWithTimeout } from "./http";
import { dedupeStrings, normalizeText } from "./utils";

const DEFAULT_SEEDS = DEFAULT_JOB_SEED_URLS;

function buildQueries(prefs: JobPreferences) {
  const titles = prefs.preferred_titles.length ? prefs.preferred_titles : ["operations", "revops", "finance", "product ops"];
  const remote = prefs.remote_only ? "remote" : "";
  const industries = prefs.industries_prefer.slice(0, 2).join(" ");

  return titles.map((title) => `${title} ${remote} ${industries} site:greenhouse.io OR site:lever.co OR site:ashbyhq.com OR site:myworkdayjobs.com`);
}

function extractLinksFromHtml(html: string) {
  const links: string[] = [];
  const regex = /href="(https?:\/\/[^\"]+)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return links;
}

function filterAtsLinks(urls: string[]) {
  return urls.filter((url) => ATS_PATTERNS.some((entry) => entry.pattern.test(url)));
}

async function duckDuckGoSearch(query: string) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetchWithTimeout(url, {
    timeoutMs: 12000,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; cl-job-match-bot/1.0; +https://cljobmatch.com)"
    }
  });
  if (!response.ok) return [];
  const html = await response.text();
  const links = extractLinksFromHtml(html);
  return filterAtsLinks(links);
}

export async function discoverJobUrls(prefs: JobPreferences, maxResults = 50): Promise<DiscoveredUrl[]> {
  const urls: string[] = [];
  const queries = buildQueries(prefs);

  for (const query of queries) {
    try {
      const results = await duckDuckGoSearch(query);
      urls.push(...results);
    } catch {
      // Swallow network errors to keep MVP pipeline running.
    }
  }

  const envSeeds = process.env.JOB_SEED_URLS?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
  urls.push(...DEFAULT_SEEDS, ...envSeeds);

  const unique = dedupeStrings(urls).slice(0, maxResults);
  return unique.map((url) => ({ url, source: "discovery" }));
}

export function isAtsVerified(url: string) {
  return ATS_PATTERNS.some((entry) => entry.pattern.test(url));
}

export function deriveCompanyFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return normalizeText(parts[0] ?? "");
  } catch {
    return "";
  }
}

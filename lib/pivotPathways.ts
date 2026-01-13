export type PivotCert = {
  name: string;
  why_it_matters: string;
  url: string;
};

export type PivotPathway = {
  industry: string;
  role_titles: string[];
  why_you_fit: string[];
  recommended_certs: PivotCert[];
  pivot_narrative_bullets: string[];
  "30_day_plan"?: string[];
  keyword_additions?: string[];
  red_flags_to_avoid?: string[];
};

export type PivotPathways = {
  pivots: PivotPathway[];
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : [];

const toCerts = (value: unknown): PivotCert[] =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const cert = item as Record<string, unknown>;
          const name = isNonEmptyString(cert.name) ? cert.name : "";
          const why = isNonEmptyString(cert.why_it_matters) ? cert.why_it_matters : "";
          const url = isNonEmptyString(cert.url) ? cert.url : "";
          if (!name || !url) return null;
          return { name, why_it_matters: why, url };
        })
        .filter((item): item is PivotCert => Boolean(item))
    : [];

export function normalizePivotPathways(input: unknown): PivotPathways | null {
  if (!input || typeof input !== "object") return null;
  const rawPivots = (input as { pivots?: unknown }).pivots;
  if (!Array.isArray(rawPivots)) return null;
  const pivots = rawPivots
    .map((pivot) => {
      if (!pivot || typeof pivot !== "object") return null;
      const data = pivot as Record<string, unknown>;
      const industry = isNonEmptyString(data.industry) ? data.industry : "";
      const role_titles = toStringArray(data.role_titles);
      const why_you_fit = toStringArray(data.why_you_fit);
      const recommended_certs = toCerts(data.recommended_certs);
      const pivot_narrative_bullets = toStringArray(data.pivot_narrative_bullets);
      const plan = toStringArray(data["30_day_plan"]);
      const keywords = toStringArray(data.keyword_additions);
      const redFlags = toStringArray(data.red_flags_to_avoid);
      if (!industry && !role_titles.length) return null;
      const normalized: PivotPathway = {
        industry,
        role_titles,
        why_you_fit,
        recommended_certs,
        pivot_narrative_bullets
      };
      if (plan.length) normalized["30_day_plan"] = plan;
      if (keywords.length) normalized.keyword_additions = keywords;
      if (redFlags.length) normalized.red_flags_to_avoid = redFlags;
      return normalized;
    })
    .filter((pivot): pivot is PivotPathway => Boolean(pivot));
  if (!pivots.length) return null;
  return { pivots };
}

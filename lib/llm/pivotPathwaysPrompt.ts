type PivotPathwaysPromptInput = {
  resumeText: string;
  resumeProfileJson?: Record<string, unknown> | null;
  preferredTitles?: string[];
  remoteOnly?: boolean;
  contractOk?: boolean;
  salaryMin?: number | null;
  industries?: string[];
};

export const pivotPathwaysSystemPrompt =
  "You are a senior talent strategist + former hiring manager. Your job is to create a “Pivot Pathways” section for an executive-grade job search report.\n" +
  "Be concise, specific, and realistic. Avoid generic career-coach fluff. Never invent facts about the candidate.\n" +
  "Do NOT fabricate credentials, employers, or certifications. Only recommend widely recognized certifications and include real, stable URLs.";

export const pivotPathwaysUserPromptTemplate = `Candidate context:
- Resume text (may be partial): {{RESUME_TEXT}}
- Parsed profile JSON (if present): {{RESUME_PROFILE_JSON}}
- Target titles (if present): {{PREFERRED_TITLES}}
- Constraints: Remote-only={{REMOTE_ONLY}}, Contract OK={{CONTRACT_OK}}, Salary min={{SALARY_MIN}}
- Current/previous industries (if known): {{INDUSTRIES}}

Task:
Create 3–4 pivot pathways (alternative, adjacent tracks) the candidate can realistically pursue within 30–60 days using their transferable skills.

For each pivot pathway, output:
- industry: string (e.g., “FinTech / Payments”)
- role_titles: 4–6 titles (real titles used in job postings)
- why_you_fit: 4–6 bullets mapping transferable skills to the pivot
- recommended_certs: 3–5 items, each:
    - name
    - why_it_matters (1 sentence)
    - url (must be a real, reputable link)
- pivot_narrative_bullets: 3–5 bullets the candidate can use to explain the pivot in interviews/LinkedIn
- 30_day_plan: 5–7 bullets (very tactical: portfolio tweaks, keyword additions, outreach targets, weekly cadence)
- keyword_additions: 10–20 keywords/phrases to add to ATS materials for this pivot
- red_flags_to_avoid: 2–4 bullets (e.g., “avoid ‘career change’ framing; use ‘adjacent expansion’ framing”)

Output format MUST be strict JSON only:
{
  "pivots": [
    {
      "industry": "...",
      "role_titles": ["..."],
      "why_you_fit": ["..."],
      "recommended_certs": [{"name":"...","why_it_matters":"...","url":"https://..."}],
      "pivot_narrative_bullets": ["..."],
      "30_day_plan": ["..."],
      "keyword_additions": ["..."],
      "red_flags_to_avoid": ["..."]
    }
  ]
}

Cert URL rules:
- Prefer official providers: AWS, Microsoft Learn, Google Cloud, PMI, Scrum.org, CompTIA, Tableau, Salesforce Trailhead, HubSpot Academy, Stripe docs/training if stable, Coursera only if it’s the official partner cert page.
- If you cannot provide a real URL, omit the cert instead of guessing.`;

export function buildPivotPathwaysPrompt(input: PivotPathwaysPromptInput) {
  const resumeText = input.resumeText?.slice(0, 12000) || "N/A";
  const resumeProfile = input.resumeProfileJson ? JSON.stringify(input.resumeProfileJson) : "N/A";
  const preferredTitles = input.preferredTitles?.length ? input.preferredTitles.join(", ") : "N/A";
  const industries = input.industries?.length ? input.industries.join(", ") : "N/A";
  const remoteOnly = input.remoteOnly ? "true" : "false";
  const contractOk = input.contractOk ? "true" : "false";
  const salaryMin = input.salaryMin ? String(input.salaryMin) : "unknown";

  const replaceToken = (template: string, token: string, value: string) =>
    template.split(token).join(value);
  let user = pivotPathwaysUserPromptTemplate;
  user = replaceToken(user, "{{RESUME_TEXT}}", resumeText);
  user = replaceToken(user, "{{RESUME_PROFILE_JSON}}", resumeProfile);
  user = replaceToken(user, "{{PREFERRED_TITLES}}", preferredTitles);
  user = replaceToken(user, "{{REMOTE_ONLY}}", remoteOnly);
  user = replaceToken(user, "{{CONTRACT_OK}}", contractOk);
  user = replaceToken(user, "{{SALARY_MIN}}", salaryMin);
  user = replaceToken(user, "{{INDUSTRIES}}", industries);

  return { system: pivotPathwaysSystemPrompt, user };
}

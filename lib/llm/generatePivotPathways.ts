import type { ResumeProfile } from "./extractResumeProfile";
import type { JobPreferences } from "../jobs/types";
import type { PivotPathways, PivotPathway, PivotCert } from "../pivotPathways";
import { normalizePivotPathways } from "../pivotPathways";
import { buildPivotPathwaysPrompt } from "./pivotPathwaysPrompt";

const fallbackCerts: PivotCert[] = [
  {
    name: "AWS Certified Cloud Practitioner",
    why_it_matters: "Baseline cloud fluency that shows you can partner with technical teams.",
    url: "https://aws.amazon.com/certification/certified-cloud-practitioner/"
  },
  {
    name: "Professional Scrum Master I (PSM I)",
    why_it_matters: "Signals structured delivery and cross-functional planning discipline.",
    url: "https://www.scrum.org/professional-scrum-master-i-certification"
  },
  {
    name: "Salesforce Administrator",
    why_it_matters: "Proves hands-on capability with the dominant CRM platform.",
    url: "https://trailhead.salesforce.com/credentials/administrator"
  },
  {
    name: "Google Data Analytics Professional Certificate",
    why_it_matters: "Validates practical analytics workflow skills for ops-heavy roles.",
    url: "https://www.coursera.org/professional-certificates/google-data-analytics"
  }
];

const fallbackTemplates: Array<{
  key: string;
  match: string[];
  pivot: PivotPathway;
}> = [
  {
    key: "revops",
    match: ["revops", "revenue", "sales ops", "gtm", "crm", "pipeline"],
    pivot: {
      industry: "RevOps / GTM Systems",
      role_titles: [
        "Revenue Operations Manager",
        "GTM Systems Manager",
        "Sales Operations Manager",
        "CRM Operations Lead",
        "Revenue Systems Analyst"
      ],
      why_you_fit: [
        "Pipeline reporting and forecasting map directly to RevOps metrics.",
        "Process automation experience translates to CRM workflow optimization.",
        "Cross-functional alignment with sales, CS, and product is core to RevOps.",
        "Data hygiene + governance wins carry over to CRM administration."
      ],
      recommended_certs: [fallbackCerts[2], fallbackCerts[1], fallbackCerts[0]],
      pivot_narrative_bullets: [
        "Frame prior ops work as revenue infrastructure enablement.",
        "Highlight automation and analytics wins that removed friction for sellers.",
        "Position yourself as the connective tissue between GTM teams."
      ],
      "30_day_plan": [
        "Add RevOps keywords + CRM tooling to headline and skills.",
        "Build a one-page CRM cleanup/automation mini-case study.",
        "Identify 15 target SaaS orgs with scaling GTM teams.",
        "Reach out to RevOps leaders with a 2-line value hook.",
        "Tailor resume bullets to pipeline impact and sales efficiency."
      ],
      keyword_additions: [
        "Salesforce",
        "HubSpot",
        "CRM hygiene",
        "lead routing",
        "pipeline velocity",
        "forecasting",
        "GTM systems",
        "deal desk",
        "RevOps analytics",
        "sales process"
      ],
      red_flags_to_avoid: [
        "Avoid vague “career change” language; position as adjacent expansion.",
        "Do not claim quota ownership if you were not a seller."
      ]
    }
  },
  {
    key: "program",
    match: ["program", "project", "pm", "delivery", "roadmap"],
    pivot: {
      industry: "Program Management / Ops Transformation",
      role_titles: [
        "Program Manager",
        "Technical Program Manager",
        "Operations Program Manager",
        "Transformation Lead",
        "PMO Manager"
      ],
      why_you_fit: [
        "Process improvements translate to cross-functional program delivery.",
        "Stakeholder management experience aligns with PMO leadership.",
        "Data-driven prioritization supports roadmap governance.",
        "Operational rigor maps to timeline and risk management."
      ],
      recommended_certs: [fallbackCerts[1], fallbackCerts[3]],
      pivot_narrative_bullets: [
        "Emphasize operational outcomes delivered through structured programs.",
        "Highlight cadence, governance, and escalation hygiene.",
        "Show how you drive alignment across functions."
      ],
      "30_day_plan": [
        "Refresh resume bullets to include scope, timeline, and outcomes.",
        "Create a 1-page program charter example from past work.",
        "Build a weekly cadence plan for status + risk reviews.",
        "Target roles in SaaS ops, finance ops, and transformation teams.",
        "Run 5 targeted outreaches per week with a clear program win."
      ],
      keyword_additions: [
        "program governance",
        "risk management",
        "roadmap",
        "OKRs",
        "cross-functional",
        "status reporting",
        "stakeholder alignment",
        "timeline management",
        "dependencies",
        "PMO"
      ],
      red_flags_to_avoid: [
        "Avoid soft, abstract language; quantify program outcomes.",
        "Don’t oversell technical depth without evidence."
      ]
    }
  },
  {
    key: "analyst",
    match: ["analyst", "analysis", "bi", "business analyst", "reporting"],
    pivot: {
      industry: "Business Analysis / Ops Analytics",
      role_titles: [
        "Business Analyst",
        "Operations Analyst",
        "Business Systems Analyst",
        "Revenue Analyst",
        "Analytics Lead"
      ],
      why_you_fit: [
        "Prior reporting and KPI work maps to analytics roles.",
        "Data cleanup experience aligns with analyst expectations.",
        "Cross-functional collaboration supports requirements gathering.",
        "Process documentation translates to analytics enablement."
      ],
      recommended_certs: [fallbackCerts[3], fallbackCerts[0]],
      pivot_narrative_bullets: [
        "Position analytics as a lever for operational efficiency.",
        "Show measurable impact from dashboarding or reporting work.",
        "Describe how you translate data into decisions."
      ],
      "30_day_plan": [
        "Add analytics tools + KPI language to resume and LinkedIn.",
        "Build a small dashboard case study using sample data.",
        "Target analytics roles in SaaS, fintech, and ops-heavy teams.",
        "Send 10 targeted messages to analytics managers.",
        "Tailor keyword map around BI and reporting."
      ],
      keyword_additions: [
        "dashboarding",
        "KPI reporting",
        "data validation",
        "SQL",
        "data quality",
        "forecasting",
        "metrics",
        "BI tools",
        "business insights",
        "stakeholder reporting"
      ],
      red_flags_to_avoid: [
        "Avoid claiming advanced data science if you lack depth.",
        "Don’t use generic ‘data-driven’ without evidence."
      ]
    }
  },
  {
    key: "ops",
    match: ["ops", "operations", "process", "service delivery"],
    pivot: {
      industry: "Operations / Process Improvement",
      role_titles: [
        "Operations Manager",
        "Process Improvement Lead",
        "Operations Analyst",
        "Service Delivery Manager",
        "Continuous Improvement Manager"
      ],
      why_you_fit: [
        "Operational process work maps directly to efficiency roles.",
        "Systems cleanup and automation translate to continuous improvement.",
        "Cross-team coordination aligns with service delivery ownership.",
        "Metrics-driven execution supports operations KPIs."
      ],
      recommended_certs: [fallbackCerts[1], fallbackCerts[0]],
      pivot_narrative_bullets: [
        "Frame yourself as a throughput and quality operator.",
        "Highlight repeatable process improvements that scaled teams.",
        "Describe how you eliminated bottlenecks with data."
      ],
      "30_day_plan": [
        "Rewrite bullets to emphasize throughput + cycle-time wins.",
        "Build a simple process map from a prior initiative.",
        "Create a 30-60-90 ops improvement outline.",
        "Target ops roles in SaaS, logistics, and fintech.",
        "Run weekly outreach sprints with 5-7 messages."
      ],
      keyword_additions: [
        "process optimization",
        "SOPs",
        "cycle time",
        "SLA",
        "service delivery",
        "continuous improvement",
        "root cause analysis",
        "workflow automation",
        "operational metrics",
        "capacity planning"
      ],
      red_flags_to_avoid: [
        "Avoid claiming ownership of functions you only supported.",
        "Don’t overstate transformation scope without metrics."
      ]
    }
  }
];

function buildKeywordHaystack(profile: ResumeProfile) {
  return [
    ...profile.roles,
    ...profile.skills,
    ...profile.tools,
    ...profile.keywords
  ]
    .join(" ")
    .toLowerCase();
}

export function generatePivotPathwaysFallback(profile: ResumeProfile): PivotPathways {
  const haystack = buildKeywordHaystack(profile);
  const matchedKeys = fallbackTemplates
    .filter((template) => template.match.some((keyword) => haystack.includes(keyword)))
    .map((template) => template.key);

  const preferredOrder = ["revops", "program", "analyst", "ops"];
  const finalKeys = Array.from(new Set([...matchedKeys, ...preferredOrder])).slice(0, 3);
  const pivots = finalKeys
    .map((key) => fallbackTemplates.find((template) => template.key === key)?.pivot)
    .filter((pivot): pivot is PivotPathway => Boolean(pivot));

  return { pivots };
}

function safeJsonParse(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function generatePivotPathways(payload: {
  resumeText: string;
  profile: ResumeProfile;
  targetTitles: string[];
  preferences: JobPreferences;
}): Promise<PivotPathways> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generatePivotPathwaysFallback(payload.profile);
  }

  const industries = Array.from(
    new Set([...(payload.profile.industries ?? []), ...(payload.preferences.industries_prefer ?? [])])
  );
  const { system, user } = buildPivotPathwaysPrompt({
    resumeText: payload.resumeText,
    resumeProfileJson: payload.profile,
    preferredTitles: payload.targetTitles,
    remoteOnly: payload.preferences.remote_only,
    contractOk: payload.preferences.contract_ok,
    salaryMin: payload.preferences.salary_min,
    industries
  });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      return generatePivotPathwaysFallback(payload.profile);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = safeJsonParse(content);
    const normalized = normalizePivotPathways(parsed);
    return normalized ?? generatePivotPathwaysFallback(payload.profile);
  } catch {
    return generatePivotPathwaysFallback(payload.profile);
  }
}

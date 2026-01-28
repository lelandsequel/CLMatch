import type { PivotPathways } from "./pivotPathways";

export type SampleReport = {
  candidate: {
    name: string;
    headline: string;
    summary: string;
    bullets: string[];
    skills: string[];
    tools: string[];
    targetRoles: string[];
    locationPreference: string;
  };
  jobs: Array<{
    role: string;
    company: string;
    fitScore: number;
    ghostScore: number;
    source: "Greenhouse" | "Lever" | "Ashby" | "Workday";
    applyUrl: string;
  }>;
  gaps: {
    skills: string[];
    certs: Array<{
      name: string;
      provider: string;
      link: string;
      studyDays: number;
    }>;
    studyPlanDays: number;
  };
  outreach: {
    hiringManagerEmail: string;
    recruiterEmail: string;
    linkedinNote: string;
    cadence: string[];
  };
  pivotPathways: PivotPathways;
};

export const sampleReport: SampleReport = {
  candidate: {
    name: "Avery Chen",
    headline: "RevOps and BizOps leader | Scaled GTM analytics, pipeline, and systems",
    summary:
      "Cross-functional operator with 8+ years in revenue operations and business operations. Expert in pipeline analytics, process automation, and stakeholder management across sales, CS, and product.",
    bullets: [
      "Built a multi-region forecasting model that improved forecast accuracy by 22%.",
      "Automated lead routing with SLAs, cutting response time from 18 hours to 45 minutes.",
      "Led Salesforce cleanup and data governance across 120+ active fields.",
      "Designed KPI framework for RevOps + CS Ops, improving retention by 9%.",
      "Partnered with finance on comp plan redesign for 140+ sellers.",
      "Implemented Looker dashboards for pipeline health and conversion analysis."
    ],
    skills: [
      "Revenue operations",
      "Business operations",
      "Pipeline analytics",
      "Forecasting",
      "Process automation",
      "Cross-functional leadership"
    ],
    tools: ["Salesforce", "HubSpot", "Looker", "Snowflake", "Airtable", "Zapier", "Jira"],
    targetRoles: [
      "RevOps Manager",
      "BizOps Lead",
      "Product Ops Manager",
      "Technical Program Manager"
    ],
    locationPreference: "Remote (US time zones). Open to quarterly travel."
  },
  jobs: [
    {
      role: "Revenue Operations Manager",
      company: "GitLab",
      fitScore: 88,
      ghostScore: 24,
      source: "Greenhouse",
      applyUrl: "https://job-boards.greenhouse.io/gitlab/jobs/4757539"
    },
    {
      role: "Business Operations Lead",
      company: "Stripe",
      fitScore: 86,
      ghostScore: 28,
      source: "Greenhouse",
      applyUrl: "https://job-boards.greenhouse.io/stripe/jobs/5132189"
    },
    {
      role: "Solutions Architect, Data",
      company: "Snowflake",
      fitScore: 79,
      ghostScore: 35,
      source: "Workday",
      applyUrl: "https://careers.snowflake.com/us/en/job/REQ-019876"
    },
    {
      role: "Technical Program Manager",
      company: "Atlassian",
      fitScore: 82,
      ghostScore: 22,
      source: "Lever",
      applyUrl: "https://jobs.lever.co/atlassian/7a2b2b11-1c8d-4b0c-9b8a-0d90b1b7e9f1"
    },
    {
      role: "Product Operations Manager",
      company: "Notion",
      fitScore: 84,
      ghostScore: 30,
      source: "Greenhouse",
      applyUrl: "https://job-boards.greenhouse.io/notion/jobs/5124034"
    },
    {
      role: "Revenue Analytics Lead",
      company: "HubSpot",
      fitScore: 85,
      ghostScore: 18,
      source: "Lever",
      applyUrl: "https://jobs.lever.co/hubspot/ea88e2f1-5c4b-4b9b-87a5-0cb4d8b2d61c"
    },
    {
      role: "GTM Operations Manager",
      company: "Zapier",
      fitScore: 80,
      ghostScore: 26,
      source: "Ashby",
      applyUrl: "https://jobs.ashbyhq.com/zapier/2c1df932-5482-4bb8-9a1b-0b3adf0fb2b0"
    },
    {
      role: "Sales Operations Manager",
      company: "Datadog",
      fitScore: 83,
      ghostScore: 33,
      source: "Greenhouse",
      applyUrl: "https://job-boards.greenhouse.io/datadog/jobs/5231446"
    },
    {
      role: "Customer Success Operations Manager",
      company: "Okta",
      fitScore: 78,
      ghostScore: 29,
      source: "Greenhouse",
      applyUrl: "https://job-boards.greenhouse.io/okta/jobs/5473201"
    },
    {
      role: "Business Operations Manager",
      company: "Shopify",
      fitScore: 77,
      ghostScore: 31,
      source: "Workday",
      applyUrl: "https://www.shopify.com/careers/positions/902211"
    }
  ],
  gaps: {
    skills: [
      "RevOps attribution modeling",
      "Usage-based revenue analytics",
      "Territory planning",
      "Enterprise deal desk collaboration",
      "Forecast scenario planning"
    ],
    certs: [
      {
        name: "Salesforce Revenue Cloud Consultant",
        provider: "Salesforce",
        link: "https://trailhead.salesforce.com/credentials/revenuecloudconsultant",
        studyDays: 21
      },
      {
        name: "HubSpot Revenue Operations",
        provider: "HubSpot Academy",
        link: "https://academy.hubspot.com/courses/revenue-operations",
        studyDays: 14
      },
      {
        name: "Looker Business Analyst",
        provider: "Google Cloud",
        link: "https://cloud.google.com/training",
        studyDays: 30
      }
    ],
    studyPlanDays: 45
  },
  outreach: {
    hiringManagerEmail:
      "Subject: RevOps leader ready to fix pipeline leakage\n\nHi [Name],\n\nI noticed your team is scaling GTM while tightening forecast accuracy. In my last role, I rebuilt the pipeline model and reduced response times by 90%, which improved conversion and predictability. I'd love to bring that same operational discipline to [Company].\n\nIf helpful, I can share a quick 30-60-90 plan for your RevOps team. Would a 15-minute chat this week be useful?\n\nThanks,\nAvery",
    recruiterEmail:
      "Subject: RevOps Manager - strong fit\n\nHi [Name],\n\nI am interested in the RevOps Manager role. I have 8+ years building pipeline analytics, automating lead routing, and partnering with finance on comp. I can drive fast wins in forecast accuracy and sales efficiency.\n\nIf it helps, I can send a brief summary of the specific systems and KPIs I would stand up in the first 30 days.\n\nBest,\nAvery",
    linkedinNote:
      "Hi [Name] - I lead RevOps/BizOps for high-growth SaaS and recently improved forecast accuracy by 22% while cutting lead response time to under an hour. Your team is scaling fast and I would love to connect and learn how you are approaching pipeline health and GTM ops.",
    cadence: [
      "Day 1: Apply + send recruiter note",
      "Day 3: Follow up with hiring manager",
      "Day 5: Share 30-60-90 outline",
      "Day 8: Light check-in + highlight a relevant win",
      "Day 11: Second follow-up with recruiter",
      "Day 14: Final check-in and close the loop"
    ]
  },
  pivotPathways: {
    pivots: [
      {
        industry: "RevOps / GTM Systems",
        role_titles: [
          "Revenue Operations Manager",
          "GTM Systems Manager",
          "Sales Operations Manager",
          "CRM Operations Lead"
        ],
        why_you_fit: [
          "Pipeline analytics + forecasting translates to RevOps reporting rigor.",
          "CRM cleanup + data governance map directly to sales systems hygiene.",
          "Cross-functional ops leadership supports GTM alignment."
        ],
        recommended_certs: [
          {
            name: "Salesforce Administrator",
            why_it_matters: "Signals hands-on CRM administration and workflow expertise.",
            url: "https://trailhead.salesforce.com/credentials/administrator"
          },
          {
            name: "Professional Scrum Master I (PSM I)",
            why_it_matters: "Shows structured delivery and stakeholder cadence discipline.",
            url: "https://www.scrum.org/professional-scrum-master-i-certification"
          }
        ],
        pivot_narrative_bullets: [
          "Position yourself as the operator who makes revenue systems run clean.",
          "Highlight automation wins that improved response time and conversion.",
          "Frame your role as the connective tissue between sales, CS, and product."
        ]
      },
      {
        industry: "FinTech Ops / Payments Implementation",
        role_titles: [
          "Payments Operations Manager",
          "Implementation Manager",
          "Merchant Onboarding Lead",
          "Payments Operations Lead"
        ],
        why_you_fit: [
          "Process automation + compliance-minded workflows map to payment ops.",
          "Stakeholder coordination supports merchant onboarding at scale.",
          "Analytics discipline transfers to payment performance tracking."
        ],
        recommended_certs: [
          {
            name: "AWS Certified Cloud Practitioner",
            why_it_matters: "Validates platform fluency for payments tooling ecosystems.",
            url: "https://aws.amazon.com/certification/certified-cloud-practitioner/"
          },
          {
            name: "Google Data Analytics Professional Certificate",
            why_it_matters: "Demonstrates reporting rigor for payment ops metrics.",
            url: "https://www.coursera.org/professional-certificates/google-data-analytics"
          }
        ],
        pivot_narrative_bullets: [
          "Frame your ops work as risk-aware, high-volume execution.",
          "Emphasize speed-to-live improvements and onboarding throughput gains.",
          "Show measurable impact on payment performance or retention."
        ]
      },
      {
        industry: "Program Management (Ops / Transformation)",
        role_titles: [
          "Program Manager",
          "Operations Program Manager",
          "Technical Program Manager",
          "Transformation Lead"
        ],
        why_you_fit: [
          "Operational change work translates to program governance.",
          "Cross-functional execution maps to PMO-style delivery.",
          "Metrics-first thinking supports roadmap prioritization."
        ],
        recommended_certs: [
          {
            name: "Professional Scrum Master I (PSM I)",
            why_it_matters: "Reinforces agile delivery and sprint discipline.",
            url: "https://www.scrum.org/professional-scrum-master-i-certification"
          },
          {
            name: "Google Data Analytics Professional Certificate",
            why_it_matters: "Supports analytics-driven program reporting.",
            url: "https://www.coursera.org/professional-certificates/google-data-analytics"
          }
        ],
        pivot_narrative_bullets: [
          "Position your ops wins as scalable program outcomes.",
          "Show how you managed timelines, risk, and executive updates.",
          "Emphasize stakeholder alignment and governance cadence."
        ]
      }
    ]
  }
};

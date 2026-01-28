export type TierId =
  | "job_radar"
  | "ghost_proof_list"
  | "interview_boost_kit"
  | "rapid_offer_lite"
  | "pivot_pack"
  | "offer_farming_report"
  | "offer_sprint"
  | "ats_single"
  | "ats_monthly";

export type TierFlags = {
  includeFullResumeRewrite: boolean;
  includeResumePatchNotes: boolean;
  includeKeywordMap: boolean;
  includeOutreachKit: boolean;
  includeCadence: boolean;
  includeCertPlan: boolean;
  expandedSourcing: boolean;
  priorityTurnaround: boolean;
  includesSecondRevision: boolean;
};

export type Tier = {
  id: TierId;
  name: string;
  badge?: string;
  priceUSD: number;
  tagline: string;
  bullets: string[];
  ctaLabel: string;
  limits: {
    maxJobs: number;
  };
  flags: TierFlags;
  shipsAutomatically: boolean;
  requiresHumanQA: boolean;
  qcStrictness: "low" | "standard" | "high";
  delivery: string;
  includesPivotPathways: boolean;
  isSubscription?: boolean;
  isATSTier?: boolean;
};

export const tiers: Tier[] = [
  {
    id: "job_radar",
    name: "Job Radar",
    priceUSD: 49,
    tagline: "A fast hit of real opportunities - today.",
    bullets: [
      "3 urgent roles with Fit + Ghost scores",
      "Clickable apply links (no aggregator junk)",
      "1 recruiter message template",
      "Delivered same day (usually)"
    ],
    ctaLabel: "Get Job Radar",
    limits: { maxJobs: 3 },
    flags: {
      includeFullResumeRewrite: false,
      includeResumePatchNotes: false,
      includeKeywordMap: false,
      includeOutreachKit: true,
      includeCadence: false,
      includeCertPlan: false,
      expandedSourcing: false,
      priorityTurnaround: true,
      includesSecondRevision: false
    },
    shipsAutomatically: true,
    requiresHumanQA: false,
    qcStrictness: "standard",
    delivery: "Same day",
    includesPivotPathways: false
  },
  {
    id: "ghost_proof_list",
    name: "Ghost-Proof Job List",
    priceUSD: 99,
    tagline: "Five real roles you can apply to immediately.",
    bullets: [
      "Top 5 urgent roles with Fit + Ghost scores",
      "Apply order (1-5) + quick 'why it fits' notes",
      "2 outreach scripts (recruiter + hiring manager)",
      "5 keywords to tailor your resume fast"
    ],
    ctaLabel: "Get the list",
    limits: { maxJobs: 5 },
    flags: {
      includeFullResumeRewrite: false,
      includeResumePatchNotes: false,
      includeKeywordMap: true,
      includeOutreachKit: true,
      includeCadence: false,
      includeCertPlan: false,
      expandedSourcing: false,
      priorityTurnaround: false,
      includesSecondRevision: false
    },
    shipsAutomatically: true,
    requiresHumanQA: false,
    qcStrictness: "standard",
    delivery: "24-48h",
    includesPivotPathways: false
  },
  {
    id: "interview_boost_kit",
    name: "Interview Boost Kit",
    priceUSD: 149,
    tagline: "Make your profile competitive in 72 hours.",
    bullets: [
      "5 urgent roles with Fit + Ghost scores",
      "ATS keyword map (what you're missing)",
      "Resume patch notes: headline + skills + bullet upgrades",
      "Outreach kit + mini follow-up cadence"
    ],
    ctaLabel: "Boost me",
    limits: { maxJobs: 5 },
    flags: {
      includeFullResumeRewrite: false,
      includeResumePatchNotes: true,
      includeKeywordMap: true,
      includeOutreachKit: true,
      includeCadence: true,
      includeCertPlan: false,
      expandedSourcing: false,
      priorityTurnaround: false,
      includesSecondRevision: false
    },
    shipsAutomatically: true,
    requiresHumanQA: false,
    qcStrictness: "standard",
    delivery: "48-72h",
    includesPivotPathways: false
  },
  {
    id: "rapid_offer_lite",
    name: "Rapid Offer Report Lite",
    priceUSD: 199,
    tagline: "The core engine - without the wait.",
    bullets: [
      "8-10 urgent roles with Fit + Ghost scores",
      "ATS resume rewrite (PDF + DOCX)",
      "Skill gaps + cert plan",
      "Outreach scripts + 14-day cadence"
    ],
    ctaLabel: "Get my report",
    limits: { maxJobs: 10 },
    flags: {
      includeFullResumeRewrite: true,
      includeResumePatchNotes: false,
      includeKeywordMap: true,
      includeOutreachKit: true,
      includeCadence: true,
      includeCertPlan: true,
      expandedSourcing: false,
      priorityTurnaround: false,
      includesSecondRevision: false
    },
    shipsAutomatically: false,
    requiresHumanQA: true,
    qcStrictness: "high",
    delivery: "24-48h",
    includesPivotPathways: false
  },
  {
    id: "pivot_pack",
    name: "Pivot Pack",
    badge: "Pivot Pathways",
    priceUSD: 299,
    tagline: "Core engine plus pivot-ready pathways.",
    bullets: [
      "ATS resume rewrite (PDF + DOCX)",
      "Top 10 urgent roles with Fit + Ghost scoring",
      "Skill gaps + cert plan",
      "Outreach scripts + 14-day cadence",
      "Pivot Pathways™: transferable skills + alternative industries + pivot narrative"
    ],
    ctaLabel: "Get Pivot Pack",
    limits: { maxJobs: 10 },
    flags: {
      includeFullResumeRewrite: true,
      includeResumePatchNotes: false,
      includeKeywordMap: true,
      includeOutreachKit: true,
      includeCadence: true,
      includeCertPlan: true,
      expandedSourcing: false,
      priorityTurnaround: false,
      includesSecondRevision: false
    },
    shipsAutomatically: false,
    requiresHumanQA: true,
    qcStrictness: "high",
    delivery: "24-48h",
    includesPivotPathways: true
  },
  {
    id: "offer_farming_report",
    name: "Offer Farming Report",
    priceUSD: 399,
    tagline: "Premium sourcing + assets built to win interviews.",
    bullets: [
      "10 urgent roles with Fit + Ghost scores",
      "Full ATS resume rewrite (PDF + DOCX)",
      "Clickable premium PDF + dashboard access",
      "Outreach kit + 14-day cadence + cert plan",
      "Pivot Pathways™ + strategic pivot narrative"
    ],
    ctaLabel: "Run the engine",
    limits: { maxJobs: 10 },
    flags: {
      includeFullResumeRewrite: true,
      includeResumePatchNotes: false,
      includeKeywordMap: true,
      includeOutreachKit: true,
      includeCadence: true,
      includeCertPlan: true,
      expandedSourcing: false,
      priorityTurnaround: false,
      includesSecondRevision: false
    },
    shipsAutomatically: false,
    requiresHumanQA: true,
    qcStrictness: "high",
    delivery: "3-5 business days",
    includesPivotPathways: true
  },
  {
    id: "offer_sprint",
    name: "Offer Sprint",
    priceUSD: 599,
    tagline: "Expanded sourcing + priority turnaround.",
    bullets: [
      "12-15 urgent roles (expanded sourcing)",
      "Deep ATS rewrite + keyword map",
      "Priority turnaround + second revision",
      "Expanded outreach sequences + follow-ups",
      "Pivot Pathways™ + executive-level positioning"
    ],
    ctaLabel: "Sprint to offers",
    limits: { maxJobs: 15 },
    flags: {
      includeFullResumeRewrite: true,
      includeResumePatchNotes: false,
      includeKeywordMap: true,
      includeOutreachKit: true,
      includeCadence: true,
      includeCertPlan: true,
      expandedSourcing: true,
      priorityTurnaround: true,
      includesSecondRevision: true
    },
    shipsAutomatically: false,
    requiresHumanQA: true,
    qcStrictness: "high",
    delivery: "Priority",
    includesPivotPathways: true
  },
  {
    id: "ats_single",
    name: "ATS Optimizer",
    priceUSD: 24.99,
    tagline: "Break through HR screening systems",
    bullets: [
      "AI-powered ATS keyword optimization",
      "4 professional templates",
      "One-page condenser option",
      "Instant results"
    ],
    ctaLabel: "Optimize now",
    limits: { maxJobs: 0 },
    flags: {
      includeFullResumeRewrite: false,
      includeResumePatchNotes: false,
      includeKeywordMap: true,
      includeOutreachKit: false,
      includeCadence: false,
      includeCertPlan: false,
      expandedSourcing: false,
      priorityTurnaround: true,
      includesSecondRevision: false
    },
    shipsAutomatically: true,
    requiresHumanQA: false,
    qcStrictness: "low",
    delivery: "Instant",
    includesPivotPathways: false,
    isATSTier: true
  },
  {
    id: "ats_monthly",
    name: "ATS Optimizer Pro",
    badge: "Best Value",
    priceUSD: 59.99,
    tagline: "Unlimited ATS optimization + 15% off premium tiers",
    bullets: [
      "Unlimited resume optimizations",
      "All 4 professional templates",
      "One-page condenser",
      "15% discount on $199+ packages"
    ],
    ctaLabel: "Go Pro",
    limits: { maxJobs: 0 },
    flags: {
      includeFullResumeRewrite: false,
      includeResumePatchNotes: false,
      includeKeywordMap: true,
      includeOutreachKit: false,
      includeCadence: false,
      includeCertPlan: false,
      expandedSourcing: false,
      priorityTurnaround: true,
      includesSecondRevision: false
    },
    shipsAutomatically: true,
    requiresHumanQA: false,
    qcStrictness: "low",
    delivery: "Instant",
    includesPivotPathways: false,
    isSubscription: true,
    isATSTier: true
  }
];

export const tierSortOrder: TierId[] = tiers.map((tier) => tier.id);

const tierMap = new Map<TierId, Tier>(tiers.map((tier) => [tier.id, tier]));

export function getTier(id?: string | null) {
  if (!id) return null;
  return tierMap.get(id as TierId) ?? null;
}

export function isPaidTier(id?: string | null) {
  return Boolean(getTier(id));
}

export function isATSTier(id?: string | null) {
  const tier = getTier(id);
  return tier?.isATSTier ?? false;
}

export function getATSTiers() {
  return tiers.filter((tier) => tier.isATSTier);
}

export function isEligibleForATSDiscount(tierId: TierId) {
  const tier = getTier(tierId);
  return tier && tier.priceUSD >= 199;
}

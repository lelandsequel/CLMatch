import type { AtsType } from "./types";

export const ATS_PATTERNS: Array<{ type: AtsType; pattern: RegExp }> = [
  { type: "greenhouse", pattern: /(job-boards|boards)\.greenhouse\.io/i },
  { type: "lever", pattern: /jobs\.lever\.co/i },
  { type: "ashby", pattern: /jobs\.ashbyhq\.com/i },
  { type: "workday", pattern: /myworkdayjobs\.com/i }
];

export const EVERGREEN_PHRASES = [
  "evergreen",
  "continuous",
  "continuously accepting",
  "rolling basis",
  "talent pipeline",
  "future opportunities",
  "always hiring",
  "keep on file",
  "general interest",
  "open requisition"
];

export const VAGUE_PHRASES = [
  "various tasks",
  "other duties",
  "as needed",
  "fast-paced",
  "dynamic environment",
  "self-starter",
  "team player",
  "wear many hats"
];

export const TOOL_KEYWORDS = [
  "sql",
  "excel",
  "tableau",
  "power bi",
  "salesforce",
  "hubspot",
  "netsuite",
  "jira",
  "asana",
  "python",
  "r",
  "ga4",
  "google analytics",
  "snowflake",
  "dbt",
  "lookml",
  "bigquery"
];

export const DELIVERABLE_KEYWORDS = [
  "build",
  "deliver",
  "launch",
  "implement",
  "own",
  "lead",
  "ship",
  "design",
  "optimize",
  "drive"
];

export const SENIORITY_LEVELS = [
  "intern",
  "junior",
  "associate",
  "mid",
  "senior",
  "lead",
  "manager",
  "director",
  "vp",
  "head",
  "chief",
  "principal"
];

export const STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "you",
  "your",
  "our",
  "their",
  "are",
  "will",
  "this",
  "that",
  "from",
  "into",
  "over",
  "under",
  "within",
  "across",
  "about",
  "role",
  "responsible",
  "responsibilities",
  "requirements"
]);

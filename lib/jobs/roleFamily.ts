import { normalizeText } from "./utils";

export type RoleFamily =
  | "TPM/PM"
  | "Product Ops/BizOps"
  | "RevOps/SalesOps"
  | "Finance/FP&A"
  | "Accounting"
  | "Solutions/SE"
  | "Implementation/Delivery"
  | "Customer Success Ops"
  | "Other";

const RULES: Array<{ family: RoleFamily; keywords: string[] }> = [
  {
    family: "TPM/PM",
    keywords: ["product manager", "program manager", "tpm", "technical program"]
  },
  {
    family: "Product Ops/BizOps",
    keywords: ["product ops", "business ops", "bizops", "strategy ops"]
  },
  {
    family: "RevOps/SalesOps",
    keywords: ["revops", "revenue ops", "sales ops", "sales operations"]
  },
  {
    family: "Finance/FP&A",
    keywords: ["fp&a", "financial planning", "finance", "treasury"]
  },
  {
    family: "Accounting",
    keywords: ["accounting", "controller", "audit", "tax"]
  },
  {
    family: "Solutions/SE",
    keywords: ["solutions engineer", "sales engineer", "pre-sales", "sales engineering"]
  },
  {
    family: "Implementation/Delivery",
    keywords: ["implementation", "delivery", "professional services", "deployment"]
  },
  {
    family: "Customer Success Ops",
    keywords: ["customer success ops", "cs ops", "customer ops", "cs operations"]
  }
];

export function classifyRoleFamily(title: string, description?: string | null): RoleFamily {
  const haystack = normalizeText(`${title} ${description ?? ""}`);
  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))) {
      return rule.family;
    }
  }
  return "Other";
}

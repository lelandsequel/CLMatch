import type { TierId } from "../pricing";

const PRICE_ENV: Record<TierId, string> = {
  job_radar: "STRIPE_PRICE_JOB_RADAR_49",
  ghost_proof_list: "STRIPE_PRICE_GHOST_PROOF_99",
  interview_boost_kit: "STRIPE_PRICE_INTERVIEW_BOOST_149",
  rapid_offer_lite: "STRIPE_PRICE_RAPID_LITE_199",
  pivot_pack: "STRIPE_PRICE_PIVOT_PACK",
  offer_farming_report: "STRIPE_PRICE_OFFER_REPORT_399",
  offer_sprint: "STRIPE_PRICE_OFFER_SPRINT_599"
};

export function getStripePriceId(tierId: TierId) {
  const envKey = PRICE_ENV[tierId];
  return process.env[envKey] ?? "";
}

export function listStripePriceEnvKeys() {
  return Object.values(PRICE_ENV);
}

export function areStripePricesConfigured() {
  return Object.values(PRICE_ENV).every((key) => Boolean(process.env[key]));
}

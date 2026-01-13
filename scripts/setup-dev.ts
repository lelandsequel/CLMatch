import fs from "fs";
import path from "path";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...rest] = trimmed.split("=");
    if (!key) return;
    const value = rest.join("=").trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function getEnv(key: string) {
  return process.env[key] ?? "";
}

function isPlaceholder(value: string) {
  return value.startsWith("YOUR_") || value === "change-me";
}

function printSection(title: string) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

const envPath = path.join(process.cwd(), ".env.local");
loadEnvFile(envPath);

const critical = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
  "JOB_PIPELINE_SECRET"
];

const optional = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_PRICE_JOB_RADAR_49",
  "STRIPE_PRICE_GHOST_PROOF_99",
  "STRIPE_PRICE_INTERVIEW_BOOST_149",
  "STRIPE_PRICE_RAPID_LITE_199",
  "STRIPE_PRICE_OFFER_REPORT_399",
  "STRIPE_PRICE_OFFER_SPRINT_599",
  "RESEND_API_KEY",
  "OPENAI_API_KEY",
  "ADMIN_EMAILS",
  "QC_AUTO_SHIP_THRESHOLD",
  "QC_PREMIUM_ALWAYS_REVIEW"
];

const missing = critical.filter((key) => {
  const value = getEnv(key);
  return !value || isPlaceholder(value);
});
const stripeDisabled = getEnv("STRIPE_DISABLED") === "true";

printSection("Env check");
if (missing.length) {
  console.log(`${RED}Missing critical vars:${RESET}`);
  missing.forEach((key) => console.log(`- ${key}`));
} else {
  console.log(`${GREEN}All critical vars present.${RESET}`);
}

if (!stripeDisabled) {
  const stripeRequired = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_PRICE_JOB_RADAR_49",
    "STRIPE_PRICE_GHOST_PROOF_99",
    "STRIPE_PRICE_INTERVIEW_BOOST_149",
    "STRIPE_PRICE_RAPID_LITE_199",
    "STRIPE_PRICE_OFFER_REPORT_399",
    "STRIPE_PRICE_OFFER_SPRINT_599"
  ];
  const stripeMissing = stripeRequired.filter((key) => {
    const value = getEnv(key);
    return !value || isPlaceholder(value);
  });
  if (stripeMissing.length) {
    console.log(`${YELLOW}Stripe disabled? STRIPE_DISABLED=true to skip.${RESET}`);
    stripeMissing.forEach((key) => console.log(`- ${key}`));
  }
}

printSection("Supabase migrations");
const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const migrations = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

migrations.forEach((file) => console.log(`- ${file}`));

printSection("Storage buckets");
console.log("- intakes");
console.log("- reports");

printSection("Stripe webhook");
const appUrl = getEnv("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";
console.log(`${appUrl}/api/stripe/webhook`);

if (missing.length) {
  process.exit(1);
}

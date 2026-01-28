# C&L Job Match v2.0 — MVP

Premium paid intake → processing → ATS assets → dashboard → admin approval.

## Run locally
1) Install deps:
```
npm install
```

2) Copy env template:
```
cp .env.local.example .env.local
```

3) Env vars (local `.env.local`):
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_JOB_RADAR_49=
STRIPE_PRICE_GHOST_PROOF_99=
STRIPE_PRICE_INTERVIEW_BOOST_149=
STRIPE_PRICE_RAPID_LITE_199=
STRIPE_PRICE_PIVOT_PACK=
STRIPE_PRICE_OFFER_REPORT_399=
STRIPE_PRICE_OFFER_SPRINT_599=
RESEND_API_KEY=
ADMIN_EMAILS=
JOB_PIPELINE_SECRET=
OPENAI_API_KEY=
STRIPE_DISABLED=true
ADMIN_BYPASS=true
DEBUG_UI_PASSWORD=
JOB_SEED_URLS=
QC_AUTO_SHIP_THRESHOLD=0.82
QC_PREMIUM_ALWAYS_REVIEW=true
```

4) Apply SQL migrations in Supabase:
- `supabase/migrations/001_job_sourcing.sql`
- `supabase/migrations/002_mvp_orders.sql`
- `supabase/migrations/003_candidates.sql`
- `supabase/migrations/004_pricing_tiers.sql`
- `supabase/migrations/005_qc_results.sql`
- `supabase/migrations/006_intake_outputs.sql`
- `supabase/migrations/007_pivot_pathways.sql`

5) Create storage buckets in Supabase:
- `reports`
- `intakes`

6) Run the setup helper:
```
npm run setup:dev
```

Optional migration list:
```
npm run db:print-migrations
```

7) Run dev:
```
npm run dev
```

## Stripe checkout (optional in dev)
- POST `/api/stripe/checkout` with `{ "tierId": "job_radar" | "ghost_proof_list" | "interview_boost_kit" | "rapid_offer_lite" | "pivot_pack" | "offer_farming_report" | "offer_sprint" }`
- If `STRIPE_DISABLED=true`, you are redirected to `/intake?dev=1`.

## Intake submission (server endpoint)
```
curl -X POST http://localhost:3000/api/intake/submit \
  -F session_id=dev-session \
  -F tier=rapid \
  -F full_name="Jordan Lane" \
  -F email="jordan@example.com" \
  -F target_titles="RevOps Manager, BizOps" \
  -F seniority=Manager \
  -F remote_only=true \
  -F contract_ok=false \
  -F resume=@/path/to/resume.pdf
```

## Dashboard
- Login via `/login` (magic link)
- Visit `/dashboard`

## Supabase Auth config
- Enable Email provider.
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

## Stripe Price IDs
- Create one Price per tier in Stripe.
- Paste each Price ID into the matching `STRIPE_PRICE_*` env var.
- Create products + prices (idempotent):
```
STRIPE_SECRET_KEY=... npm run stripe:create-tiers
```

## Admin
- `/admin` is gated by `ADMIN_EMAILS` or `ADMIN_BYPASS=true`.

## Job pipeline (debug)
- `/debug/jobs` (disabled in production unless `DEBUG_UI_PASSWORD` set)
- Click “Create test candidate” to generate a UUID (requires `JOB_PIPELINE_SECRET`).

## Seed URLs
- Default seeds live in `lib/jobs/seeds.ts`.
- Override with `JOB_SEED_URLS` (comma-separated ATS boards).
- Seeds are deduped automatically.

## Example resume_profile_json
```
{
  "skills": ["SQL", "Tableau", "Salesforce"],
  "tools": ["Excel", "Snowflake"],
  "roles": ["RevOps Manager"],
  "seniority": "manager",
  "industries": ["SaaS"],
  "keywords": ["pipeline", "forecasting"],
  "locations": ["Remote"],
  "achievements": ["Grew ARR 20% in 12 months"]
}
```

## Troubleshooting
- 401 Unauthorized: set `JOB_PIPELINE_SECRET` and include `x-job-pipeline-secret`.
- No jobs returned: add ATS seeds in `JOB_SEED_URLS` or relax preferred titles.
- Report generation slow: reduce `JOB_DISCOVERY_MAX` or run in background.

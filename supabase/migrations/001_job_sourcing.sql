create extension if not exists "pgcrypto";

create table if not exists job_runs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null,
  status text not null default 'running' check (status in ('queued', 'running', 'completed', 'failed')),
  preferences jsonb not null,
  resume_profile jsonb not null,
  target_job_description text,
  target_job_url text,
  max_results integer,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists job_sources (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  ats_type text not null,
  http_status integer,
  fetched_at timestamptz not null,
  raw_html text,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references job_runs(id) on delete cascade,
  candidate_id uuid not null,
  title text not null,
  company_name text not null,
  location text,
  is_remote boolean,
  posted_at timestamptz,
  description text,
  apply_url text not null,
  source_url text not null,
  ats_type text not null,
  fit_score integer,
  ghost_risk_score integer,
  reasons_fit text[],
  reasons_ghost text[],
  recommended_apply_path text,
  short_summary text,
  normalized_company text,
  normalized_title text,
  canonical_apply_url text,
  dedupe_key text unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_job_runs_candidate_created on job_runs(candidate_id, created_at desc);
create index if not exists idx_jobs_candidate_id on jobs(candidate_id);
create index if not exists idx_jobs_run_id on jobs(run_id);
create index if not exists idx_jobs_fit_score on jobs(fit_score desc);
create index if not exists idx_jobs_ghost_score on jobs(ghost_risk_score asc);
create index if not exists idx_jobs_dedupe_key on jobs(dedupe_key);

alter table job_runs enable row level security;
alter table jobs enable row level security;
alter table job_sources enable row level security;

create policy "job_runs_select_own" on job_runs
  for select using (candidate_id = auth.uid());

create policy "job_runs_insert_service" on job_runs
  for insert with check (auth.role() = 'service_role');

create policy "job_runs_update_service" on job_runs
  for update using (auth.role() = 'service_role');

create policy "jobs_select_own" on jobs
  for select using (candidate_id = auth.uid());

create policy "jobs_insert_service" on jobs
  for insert with check (auth.role() = 'service_role');

create policy "jobs_update_service" on jobs
  for update using (auth.role() = 'service_role');

create policy "job_sources_service_only" on job_sources
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

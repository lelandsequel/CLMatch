create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  full_name text,
  stripe_session_id text,
  stripe_payment_status text,
  product_tier text,
  status text not null default 'draft' check (status in ('draft', 'processing', 'needs_review', 'approved')),
  created_at timestamptz not null default now()
);

create table if not exists intakes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  resume_storage_path text,
  linkedin_url text,
  target_titles text[],
  seniority text,
  preferences jsonb,
  target_job_url text,
  target_jd text,
  resume_profile_json jsonb,
  outreach_text text,
  gap_suggestions text[],
  cert_suggestions text[],
  created_at timestamptz not null default now()
);

create table if not exists artifacts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  kind text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

alter table job_runs add column if not exists order_id uuid references orders(id) on delete set null;

create index if not exists idx_orders_email on orders(email);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_intakes_order_id on intakes(order_id);
create index if not exists idx_artifacts_order_id on artifacts(order_id);
create index if not exists idx_job_runs_order_id on job_runs(order_id);

alter table orders enable row level security;
alter table intakes enable row level security;
alter table artifacts enable row level security;
alter table admin_notes enable row level security;

-- Orders policies
create policy "orders_select_own" on orders
  for select using (
    email = (auth.jwt() ->> 'email')
    or user_id = auth.uid()
  );

create policy "orders_service_all" on orders
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Intakes policies
create policy "intakes_select_own" on intakes
  for select using (
    exists (
      select 1 from orders o
      where o.id = intakes.order_id
      and (o.email = (auth.jwt() ->> 'email') or o.user_id = auth.uid())
    )
  );

create policy "intakes_service_all" on intakes
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Artifacts policies
create policy "artifacts_select_own" on artifacts
  for select using (
    exists (
      select 1 from orders o
      where o.id = artifacts.order_id
      and (o.email = (auth.jwt() ->> 'email') or o.user_id = auth.uid())
    )
  );

create policy "artifacts_service_all" on artifacts
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Admin notes policies
create policy "admin_notes_service_all" on admin_notes
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Refresh job_run policies to allow order-based access
drop policy if exists job_runs_select_own on job_runs;
create policy "job_runs_select_own" on job_runs
  for select using (
    exists (
      select 1 from orders o
      where o.id = job_runs.order_id
      and (o.email = (auth.jwt() ->> 'email') or o.user_id = auth.uid())
    )
    or candidate_id = auth.uid()
  );

-- Refresh jobs policies to allow order-based access
drop policy if exists jobs_select_own on jobs;
create policy "jobs_select_own" on jobs
  for select using (
    exists (
      select 1
      from job_runs jr
      join orders o on o.id = jr.order_id
      where jr.id = jobs.run_id
      and (o.email = (auth.jwt() ->> 'email') or o.user_id = auth.uid())
    )
    or candidate_id = auth.uid()
  );

alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check (
  status in (
    'draft',
    'processing',
    'qc_repairing',
    'auto_qc_failed',
    'needs_review',
    'approved_auto',
    'approved_manual',
    'delivered',
    'failed'
  )
);

create table if not exists qc_results (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  run_id uuid references job_runs(id) on delete set null,
  tier_id text,
  qc_strictness text,
  confidence_total numeric,
  confidence_resume numeric,
  confidence_jobs numeric,
  confidence_outreach numeric,
  confidence_certs numeric,
  hard_fail boolean default false,
  flags jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_qc_results_order_id on qc_results(order_id);
create index if not exists idx_qc_results_created_at on qc_results(created_at);

alter table qc_results enable row level security;

create policy "qc_results_select_own" on qc_results
  for select using (
    exists (
      select 1 from orders o
      where o.id = qc_results.order_id
      and (o.email = (auth.jwt() ->> 'email') or o.user_id = auth.uid())
    )
  );

create policy "qc_results_service_all" on qc_results
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

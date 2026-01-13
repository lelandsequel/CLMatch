create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);

alter table candidates enable row level security;

create policy "candidates_select_own" on candidates
  for select using (
    id = auth.uid()
    or email = (auth.jwt() ->> 'email')
  );

create policy "candidates_service_all" on candidates
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

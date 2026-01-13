alter table orders add column if not exists tier_id text;
alter table orders add column if not exists price_usd integer;
alter table orders add column if not exists included_features jsonb;
alter table orders add column if not exists max_jobs integer;

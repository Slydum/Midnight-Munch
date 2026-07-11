-- Midnight Munch — Supabase schema.
-- Run this in the Supabase SQL editor of a new project, then enable
-- Realtime for these tables (Database → Replication → supabase_realtime).
--
-- Access model: shared-link app with no accounts. The anon key is the
-- "link"; RLS is enabled with permissive policies so both users (and only
-- people holding the deployed URL) can read/write everything.

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ingredients jsonb not null default '[]',      -- [{name, qty, unit, section}]
  cost numeric not null default 0,
  prep_effort text not null default 'one-pan',  -- no-cook | one-pan | batch-cook
  time_slots text[] not null default '{pre}',   -- pre | mid | post
  nutrition_tags text[] not null default '{}',  -- protein | B12 | iron | omega-3
  plant_based boolean not null default false,
  instructions text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists week_plans (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,
  slots jsonb not null default '{}',            -- { "YYYY-MM-DD": { pre|mid|post: {meal_id, locked, leftover} } }
  budget_ceiling numeric not null default 0,
  grocery_checks jsonb not null default '{}',   -- { "<item key>": true }
  created_at timestamptz not null default now()
);

create table if not exists leftovers (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid references meals(id) on delete cascade,
  servings_left int not null default 0,
  made_on date,
  created_at timestamptz not null default now()
);

create table if not exists saved_weeks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slots jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id text primary key,                          -- single row, id = 'main'
  budget_ceiling numeric not null default 1500,
  cooldown_days int not null default 10,
  mantra text not null default '',
  created_at timestamptz not null default now()
);

-- Open policies: the deployed link is the access boundary (no accounts by design).
alter table meals enable row level security;
alter table week_plans enable row level security;
alter table leftovers enable row level security;
alter table saved_weeks enable row level security;
alter table settings enable row level security;

create policy "open access" on meals for all using (true) with check (true);
create policy "open access" on week_plans for all using (true) with check (true);
create policy "open access" on leftovers for all using (true) with check (true);
create policy "open access" on saved_weeks for all using (true) with check (true);
create policy "open access" on settings for all using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table meals, week_plans, leftovers, saved_weeks, settings;

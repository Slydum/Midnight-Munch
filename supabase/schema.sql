-- Midnight Munch — Supabase schema.
-- Run this in a dedicated Supabase project for the shared household app.
-- Access model: anyone with the shared app link can read/write app data.
-- Do not reuse a database that contains unrelated/private application data.

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ingredients jsonb not null default '[]',
  cost numeric not null default 0,
  prep_effort text not null default 'one-pan',
  time_slots text[] not null default '{pre}',
  nutrition_tags text[] not null default '{}',
  plant_based boolean not null default false,
  instructions text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists week_plans (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,
  slots jsonb not null default '{}',
  budget_ceiling numeric not null default 0,
  grocery_checks jsonb not null default '{}',
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
  id text primary key,
  budget_ceiling numeric not null default 1500,
  cooldown_days int not null default 10,
  mantra text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists cooking_sessions (
  id text primary key,
  recipe_id text not null default '',
  step_index integer not null default 0,
  servings integer not null default 4,
  checked_ingredients jsonb not null default '[]',
  completed_steps jsonb not null default '[]',
  is_running boolean not null default false,
  timer_end_at timestamptz,
  remaining_seconds integer not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table meals enable row level security;
alter table week_plans enable row level security;
alter table leftovers enable row level security;
alter table saved_weeks enable row level security;
alter table settings enable row level security;
alter table cooking_sessions enable row level security;

drop policy if exists "open access" on meals;
drop policy if exists "open access" on week_plans;
drop policy if exists "open access" on leftovers;
drop policy if exists "open access" on saved_weeks;
drop policy if exists "open access" on settings;
drop policy if exists "open access" on cooking_sessions;
create policy "open access" on meals for all using (true) with check (true);
create policy "open access" on week_plans for all using (true) with check (true);
create policy "open access" on leftovers for all using (true) with check (true);
create policy "open access" on saved_weeks for all using (true) with check (true);
create policy "open access" on settings for all using (true) with check (true);
create policy "open access" on cooking_sessions for all using (true) with check (true);

alter publication supabase_realtime add table meals, week_plans, leftovers, saved_weeks, settings, cooking_sessions;

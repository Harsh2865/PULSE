-- ============================================================
-- PULSE — 0001_init.sql (Phase 0 foundation)
-- Run this in the Supabase Dashboard SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE throughout.
-- ============================================================

-- ------------------------------------------------------------
-- profiles: one row per authenticated student
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  course text,
  year smallint check (year between 1 and 8),
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  bio text,
  reputation integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_full_name_idx on public.profiles (full_name);

-- ------------------------------------------------------------
-- deadlines: student-owned academic deadlines (Deadline Radar)
-- ------------------------------------------------------------
create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  subject text not null default 'General' check (char_length(subject) <= 120),
  description text,
  due_date date not null,
  due_time time,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  type text not null default 'other'
    check (type in ('assignment', 'exam', 'quiz', 'project', 'application', 'event', 'personal', 'other')),
  status text not null default 'open'
    check (status in ('open', 'completed')),
  link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deadlines_due_date_sane check (due_date >= date '2020-01-01')
);

create index if not exists deadlines_user_due_date_idx
  on public.deadlines (user_id, due_date);
create index if not exists deadlines_user_status_idx
  on public.deadlines (user_id, status);

-- ------------------------------------------------------------
-- updated_at maintenance
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists deadlines_set_updated_at on public.deadlines;
create trigger deadlines_set_updated_at
  before update on public.deadlines
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- auto-create a profile row whenever a user signs up
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Dropping a trigger on auth.users can fail with "must be owner" on some
-- projects; guard it so the rest of the migration always runs.
do $$
begin
  drop trigger if exists on_auth_user_created on auth.users;
exception
  when insufficient_privilege then null;
end $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

-- Explicit privileges: some projects do not apply Supabase's default
-- grants when tables are created from the SQL Editor, which surfaces as
-- "permission denied for table" at runtime.
grant usage on schema public to anon, authenticated;

grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;

grant select, insert, update, delete on public.deadlines to authenticated;

-- Refresh the API's schema cache so new privileges take effect immediately.
notify pgrst, 'reload schema';

-- profiles: readable by authenticated users, editable only by owner
alter table public.profiles enable row level security;

drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles updatable by owner" on public.profiles;
create policy "profiles updatable by owner"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Reputation is system-controlled: block direct writes to it and
-- to identity columns the owner must not change.
create or replace function public.guard_profile_columns()
returns trigger
language plpgsql
as $$
begin
  new.id := old.id;
  new.email := old.email;
  new.reputation := old.reputation;
  return new;
end;
$$;

drop trigger if exists profiles_guard_columns on public.profiles;
create trigger profiles_guard_columns
  before update on public.profiles
  for each row execute function public.guard_profile_columns();

-- deadlines: full CRUD restricted to the owning student
alter table public.deadlines enable row level security;

drop policy if exists "deadlines readable by owner" on public.deadlines;
create policy "deadlines readable by owner"
  on public.deadlines for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "deadlines insertable by owner" on public.deadlines;
create policy "deadlines insertable by owner"
  on public.deadlines for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "deadlines updatable by owner" on public.deadlines;
create policy "deadlines updatable by owner"
  on public.deadlines for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "deadlines deletable by owner" on public.deadlines;
create policy "deadlines deletable by owner"
  on public.deadlines for delete
  to authenticated
  using (auth.uid() = user_id);

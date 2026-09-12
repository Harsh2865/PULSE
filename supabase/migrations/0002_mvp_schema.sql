-- ============================================================
-- PULSE — 0002_mvp_schema.sql (Phases 3-7 MVP Tables & Policies)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE throughout.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Deadlines extension (Phase 2)
-- ------------------------------------------------------------
alter table if exists public.deadlines
  add column if not exists estimated_minutes integer default 60,
  add column if not exists importance text default 'medium' check (importance in ('low', 'medium', 'high'));

-- ------------------------------------------------------------
-- 2. Campus Events (Phase 3)
-- ------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  category text not null default 'Other'
    check (category in ('Hackathons', 'Clubs', 'Workshops', 'Competitions', 'Academic', 'Other')),
  description text,
  event_date date not null,
  event_time time,
  location text not null check (char_length(location) <= 200),
  poster_url text,
  registration_url text,
  status text not null default 'open' check (status in ('open', 'closed', 'postponed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (event_date);
create index if not exists events_category_idx on public.events (category);

create table if not exists public.event_updates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  update_type text not null default 'venue_change'
    check (update_type in ('venue_change', 'time_change', 'deadline_extended', 'announcement')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.event_confirmations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  update_id uuid references public.event_updates (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  is_confirmed boolean not null default true,
  created_at timestamptz not null default now(),
  constraint event_confirmation_unique unique (event_id, user_id, update_id)
);

-- ------------------------------------------------------------
-- 3. Class Recaps & Catch Up (Phase 4)
-- ------------------------------------------------------------
create table if not exists public.class_recaps (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  course_name text not null check (char_length(course_name) <= 120),
  class_date date not null,
  topics text[] not null default '{}',
  summary text not null,
  assignment_announced boolean not null default false,
  assignment_details text,
  important_notes text,
  notes_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists class_recaps_course_date_idx on public.class_recaps (course_name, class_date);

create table if not exists public.recap_confirmations (
  id uuid primary key default gen_random_uuid(),
  recap_id uuid not null references public.class_recaps (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  is_helpful boolean not null default true,
  created_at timestamptz not null default now(),
  constraint recap_confirmations_unique unique (recap_id, user_id)
);

-- ------------------------------------------------------------
-- 4. Study Planner & Recovery Mode (Phase 5)
-- ------------------------------------------------------------
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null check (char_length(subject) <= 120),
  exam_date date not null,
  daily_available_minutes integer not null default 120 check (daily_available_minutes between 30 and 720),
  created_at timestamptz not null default now()
);

create table if not exists public.syllabus_topics (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  name text not null check (char_length(name) <= 200),
  difficulty text not null default 'medium' check (difficulty in ('low', 'medium', 'high')),
  importance text not null default 'medium' check (importance in ('low', 'medium', 'high')),
  confidence integer not null default 30 check (confidence between 0 and 100),
  estimated_minutes integer not null default 45,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id uuid not null references public.syllabus_topics (id) on delete cascade,
  scheduled_date date not null,
  planned_minutes integer not null default 45,
  completed boolean not null default false,
  missed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. TeamUp & SkillSwap (Phase 6)
-- ------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) <= 150),
  description text not null,
  project_type text not null default 'Hackathon' check (project_type in ('Hackathon', 'Course Project', 'Startup', 'Open Source', 'Study Group')),
  created_at timestamptz not null default now()
);

create table if not exists public.project_roles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  skill text not null check (char_length(skill) <= 80),
  filled boolean not null default false
);

create table if not exists public.team_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists public.skill_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skill_name text not null,
  offer_type text not null check (offer_type in ('teach', 'learn')),
  created_at timestamptz not null default now()
);

create table if not exists public.skill_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  learner_id uuid not null references auth.users (id) on delete cascade,
  skill_name text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  rating integer check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. Reputation & Badges (Phase 7)
-- ------------------------------------------------------------
create table if not exists public.reputation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  points integer not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  requirement_type text not null,
  requirement_value integer not null
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  constraint user_badges_unique unique (user_id, badge_id)
);

-- Seed standard badges
insert into public.badges (id, name, description, icon, requirement_type, requirement_value)
values
  ('campus_scout', 'Campus Scout', 'Posted 5 useful campus events.', 'CalendarClock', 'events_posted', 5),
  ('class_reporter', 'Class Reporter', 'Contributed 5 verified class recaps.', 'GraduationCap', 'recaps_submitted', 5),
  ('skill_mentor', 'Skill Mentor', 'Completed 3 SkillSwap teaching sessions.', 'Sparkles', 'skills_taught', 3),
  ('team_builder', 'Team Builder', 'Successfully collaborated on 2 student projects.', 'Users', 'teams_joined', 2),
  ('campus_champion', 'Campus Champion', 'Active contributor across all 4 PULSE pillars.', 'Trophy', 'reputation_score', 100)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 7. Row Level Security & Grants
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.event_updates to authenticated;
grant select, insert, update, delete on public.event_confirmations to authenticated;

grant select, insert, update, delete on public.class_recaps to authenticated;
grant select, insert, update, delete on public.recap_confirmations to authenticated;

grant select, insert, update, delete on public.exams to authenticated;
grant select, insert, update, delete on public.syllabus_topics to authenticated;
grant select, insert, update, delete on public.study_sessions to authenticated;

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_roles to authenticated;
grant select, insert, update, delete on public.team_requests to authenticated;

grant select, insert, update, delete on public.skills to authenticated;
grant select, insert, update, delete on public.skill_offers to authenticated;
grant select, insert, update, delete on public.skill_sessions to authenticated;

grant select on public.reputation_events to authenticated;
grant select on public.badges to authenticated;
grant select on public.user_badges to authenticated;

-- Enable RLS
alter table public.events enable row level security;
alter table public.event_updates enable row level security;
alter table public.event_confirmations enable row level security;
alter table public.class_recaps enable row level security;
alter table public.recap_confirmations enable row level security;
alter table public.exams enable row level security;
alter table public.syllabus_topics enable row level security;
alter table public.study_sessions enable row level security;
alter table public.projects enable row level security;
alter table public.project_roles enable row level security;
alter table public.team_requests enable row level security;
alter table public.skills enable row level security;
alter table public.skill_offers enable row level security;
alter table public.skill_sessions enable row level security;
alter table public.reputation_events enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Policies: Community-readable items
drop policy if exists "events readable by all authenticated" on public.events;
create policy "events readable by all authenticated" on public.events for select to authenticated using (true);
drop policy if exists "events insertable by creator" on public.events;
create policy "events insertable by creator" on public.events for insert to authenticated with check (auth.uid() = creator_id);
drop policy if exists "events updatable by creator" on public.events;
create policy "events updatable by creator" on public.events for update to authenticated using (auth.uid() = creator_id);

drop policy if exists "recaps readable by all authenticated" on public.class_recaps;
create policy "recaps readable by all authenticated" on public.class_recaps for select to authenticated using (true);
drop policy if exists "recaps insertable by creator" on public.class_recaps;
create policy "recaps insertable by creator" on public.class_recaps for insert to authenticated with check (auth.uid() = creator_id);

drop policy if exists "projects readable by all authenticated" on public.projects;
create policy "projects readable by all authenticated" on public.projects for select to authenticated using (true);
drop policy if exists "projects insertable by creator" on public.projects;
create policy "projects insertable by creator" on public.projects for insert to authenticated with check (auth.uid() = creator_id);

-- Policies: Owner-only private study planner
drop policy if exists "exams owner access" on public.exams;
create policy "exams owner access" on public.exams for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "study sessions owner access" on public.study_sessions;
create policy "study sessions owner access" on public.study_sessions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "badges readable by all" on public.badges;
create policy "badges readable by all" on public.badges for select to authenticated using (true);

drop policy if exists "user badges readable by all" on public.user_badges;
create policy "user badges readable by all" on public.user_badges for select to authenticated using (true);

notify pgrst, 'reload schema';

# PULSE Database Setup

PULSE uses ordered SQL migrations in `supabase/migrations`. Apply every migration
in filename order to the same Supabase project. Do not skip the corrective
RLS migrations: they are part of the required schema history.

## What it creates

| Object | Purpose |
| --- | --- |
| `public.profiles` | One row per student (name, course, year, skills, bio, reputation). Auto-created on signup by a trigger on `auth.users`. |
| `public.deadlines` | Deadline Radar records, owned by a single student (`user_id`). |
| RLS policies | Profiles: readable by authenticated users, updatable only by the owner, with a trigger that blocks direct edits to `reputation`/`id`/`email`. Deadlines: full CRUD only for the owning student. |
| Indexes | `(user_id, due_date)` and `(user_id, status)` on deadlines; name index on profiles. |

## Migrations

| Migration | Purpose |
| --- | --- |
| `supabase/migrations/0001_init.sql` | Phase 0 foundation: `profiles`, `deadlines`, triggers, RLS policies. |
| `supabase/migrations/0002_mvp_schema.sql` | Deadline extensions plus the Events, Catch Up, Planner, Connect, Reputation, and Badges tables and base RLS policies. |
| `supabase/migrations/0003_storage_policies.sql` | Documents that the current app uses external URLs rather than native Supabase Storage uploads. |
| `supabase/migrations/0004_fix_planner_rls.sql` | Adds syllabus-topic access required for planner persistence. |
| `supabase/migrations/0005_fix_events_rls.sql` | Adds event-update, event-confirmation, and recap-confirmation policies. |
| `supabase/migrations/0006_fix_connect_rls.sql` | Adds Connect Hub policies for roles, requests, skills, sessions, and reputation reads. |

## How to run migrations

1. Open your Supabase project dashboard (SQL Editor).
2. Run `0001_init.sql` first if not already applied.
3. Run every remaining file in numeric order through `0006_fix_connect_rls.sql`.
4. Verify RLS is enabled for the relevant tables in Supabase before using the app.

The application communicates with Supabase via `@supabase/ssr` using Row Level
Security (RLS); no service-role key is required by the application.

# PULSE

PULSE is a campus productivity app that turns deadlines, study plans, class recaps, events, and peer collaboration into clear next actions.

## What is PULSE?

University information is fragmented across messages, groups, and portals. PULSE brings the student workflow together: manage academic deadlines, build an exam plan, recover from missed sessions, catch up on classes, discover events, and find project collaborators or skill-swap partners.

## Core Features

- **Dashboard** — responsive command center for PULSE routes.
- **Deadline Radar** — persistent deadline CRUD, completion tracking, filters, validation, and deterministic urgency ordering.
- **Study Planner and Recovery Mode** — create exams and syllabus topics, generate deterministic study sessions, and rebalance missed work.
- **What Did I Miss?** — report missed classes and browse or submit class recaps.
- **Campus Events** — create, browse, filter, inspect, and confirm campus-event updates.
- **Connect Hub** — projects, role-based teammate matches, and SkillSwap activity.
- **Deterministic logic** — scheduling, recovery, matching, reputation, and event reliability are explainable application logic.

## Key Technical Highlights

- Next.js App Router, TypeScript, and Tailwind CSS.
- Supabase Auth, PostgreSQL, and `@supabase/ssr` cookie-aware clients.
- Row Level Security policies maintained in ordered SQL migrations.
- React Hook Form and Zod validation.
- Responsive desktop/mobile navigation and route-level loading states.

## Architecture

```text
Student
  |
  v
Next.js application
  |
  +-- UI and deterministic application logic
  |
  v
Supabase
  +-- Authentication
  +-- PostgreSQL
  +-- Row Level Security
```

## Database

The migration history is in [`supabase/migrations`](./supabase/migrations). It covers profiles and deadlines, then MVP tables for events, recaps, exams/topics/sessions, projects/roles/requests, skills/sessions, reputation, and badges.

Apply every migration in numeric order. The later migrations are required RLS corrections and must not be skipped:

1. `0001_init.sql`
2. `0002_mvp_schema.sql`
3. `0003_storage_policies.sql`
4. `0004_fix_planner_rls.sql`
5. `0005_fix_events_rls.sql`
6. `0006_fix_connect_rls.sql`

See [`docs/DATABASE.md`](./docs/DATABASE.md) for setup details.

## Local Development

Prerequisites: Node.js 18+ and an accessible Supabase project.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set these values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

`.env.local` is intentionally ignored. Never commit credentials or a Supabase service-role key.

## Supabase Setup

Open the Supabase SQL Editor and run every file in `supabase/migrations` in numeric order. Confirm RLS is enabled and the migration history is applied to the same project referenced by `.env.local`.

The current UI accepts external poster and notes URLs; it does not perform native Supabase Storage uploads. `0003_storage_policies.sql` documents this intentionally.

## Verification and Build

```bash
npm test
npx tsc --noEmit
npm run build
```

## Deployment

No deployment configuration or deployment URL is committed. The repository is ready for a standard Next.js deployment such as Vercel:

1. Import the Git repository into Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the production environment.
3. Deploy with `npm run build`.
4. Ensure the production Supabase project has all six migrations applied.

## Project Structure

```text
src/                   Routes, components, deterministic logic, Supabase clients
supabase/migrations/   Ordered PostgreSQL schema and RLS migrations
docs/DATABASE.md        Database setup reference
```

## Hackathon Highlights

PULSE emphasizes real persistence and explainable decisions. Students can understand why a deadline is urgent, why a study topic is scheduled, how missed work is rebalanced, how an event earns reliability, and how a teammate match is ranked.

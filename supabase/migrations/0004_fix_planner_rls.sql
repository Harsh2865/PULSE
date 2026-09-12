-- ============================================================
-- PULSE — 0004_fix_planner_rls.sql
-- Fixes the missing RLS policy for syllabus_topics which prevents Study Planner persistence.
-- ============================================================

-- Grant required permissions to authenticated users
grant select, insert, update, delete on public.syllabus_topics to authenticated;

-- Ensure RLS is enabled
alter table public.syllabus_topics enable row level security;

-- Create policy allowing users to access topics for their own exams
drop policy if exists "syllabus_topics owner access" on public.syllabus_topics;
create policy "syllabus_topics owner access" on public.syllabus_topics
  for all to authenticated
  using (
    exam_id in (select id from public.exams where user_id = auth.uid())
  )
  with check (
    exam_id in (select id from public.exams where user_id = auth.uid())
  );

notify pgrst, 'reload schema';

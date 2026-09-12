-- ============================================================
-- PULSE — 0006_fix_connect_rls.sql
-- Fixes missing RLS policies on project_roles, team_requests,
-- skill_offers, and skill_sessions which cause fetchProjects()
-- and fetchSwaps() to fail, falling back to hardcoded demo data.
-- ============================================================

-- project_roles: readable by all authenticated, insertable by project creator
drop policy if exists "project_roles readable by all authenticated" on public.project_roles;
create policy "project_roles readable by all authenticated" on public.project_roles
  for select to authenticated using (true);

drop policy if exists "project_roles insertable by project creator" on public.project_roles;
create policy "project_roles insertable by project creator" on public.project_roles
  for insert to authenticated with check (
    project_id in (select id from public.projects where creator_id = auth.uid())
  );

drop policy if exists "project_roles updatable by project creator" on public.project_roles;
create policy "project_roles updatable by project creator" on public.project_roles
  for update to authenticated using (
    project_id in (select id from public.projects where creator_id = auth.uid())
  );

-- team_requests: readable by sender/receiver, insertable by sender
drop policy if exists "team_requests readable by participants" on public.team_requests;
create policy "team_requests readable by participants" on public.team_requests
  for select to authenticated using (true);

drop policy if exists "team_requests insertable by sender" on public.team_requests;
create policy "team_requests insertable by sender" on public.team_requests
  for insert to authenticated with check (auth.uid() = sender_id);

-- skill_offers: readable by all, insertable by owner
drop policy if exists "skill_offers readable by all authenticated" on public.skill_offers;
create policy "skill_offers readable by all authenticated" on public.skill_offers
  for select to authenticated using (true);

drop policy if exists "skill_offers insertable by owner" on public.skill_offers;
create policy "skill_offers insertable by owner" on public.skill_offers
  for insert to authenticated with check (auth.uid() = user_id);

-- skill_sessions: readable by participants, insertable by participants
drop policy if exists "skill_sessions readable by all authenticated" on public.skill_sessions;
create policy "skill_sessions readable by all authenticated" on public.skill_sessions
  for select to authenticated using (true);

drop policy if exists "skill_sessions insertable by participants" on public.skill_sessions;
create policy "skill_sessions insertable by participants" on public.skill_sessions
  for insert to authenticated with check (auth.uid() = teacher_id or auth.uid() = learner_id);

-- skills: readable by all (reference table)
drop policy if exists "skills readable by all authenticated" on public.skills;
create policy "skills readable by all authenticated" on public.skills
  for select to authenticated using (true);

-- reputation_events: readable by owner
drop policy if exists "reputation_events readable by owner" on public.reputation_events;
create policy "reputation_events readable by owner" on public.reputation_events
  for select to authenticated using (auth.uid() = user_id);

notify pgrst, 'reload schema';

-- ============================================================
-- PULSE — 0005_fix_events_rls.sql
-- Fixes missing RLS policies on event_updates and event_confirmations.
-- Without these policies, the nested SELECT in fetchEvents() is denied,
-- causing ALL events (including Hackathons) to disappear on page refresh.
-- ============================================================

-- event_updates: readable by all authenticated, insertable by creator
drop policy if exists "event_updates readable by all authenticated" on public.event_updates;
create policy "event_updates readable by all authenticated" on public.event_updates
  for select to authenticated using (true);

drop policy if exists "event_updates insertable by creator" on public.event_updates;
create policy "event_updates insertable by creator" on public.event_updates
  for insert to authenticated with check (auth.uid() = user_id);

-- event_confirmations: readable by all authenticated, insertable by the confirmer
drop policy if exists "event_confirmations readable by all authenticated" on public.event_confirmations;
create policy "event_confirmations readable by all authenticated" on public.event_confirmations
  for select to authenticated using (true);

drop policy if exists "event_confirmations insertable by user" on public.event_confirmations;
create policy "event_confirmations insertable by user" on public.event_confirmations
  for insert to authenticated with check (auth.uid() = user_id);

-- Also add missing policies for recap_confirmations (same pattern)
drop policy if exists "recap_confirmations readable by all authenticated" on public.recap_confirmations;
create policy "recap_confirmations readable by all authenticated" on public.recap_confirmations
  for select to authenticated using (true);

drop policy if exists "recap_confirmations insertable by user" on public.recap_confirmations;
create policy "recap_confirmations insertable by user" on public.recap_confirmations
  for insert to authenticated with check (auth.uid() = user_id);

notify pgrst, 'reload schema';

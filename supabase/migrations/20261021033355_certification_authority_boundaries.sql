-- Enforce the already-declared reward and Event authority contracts.
-- Existing duplicate reward keys cause a safe migration failure; never delete them.
create unique index if not exists coin_ledger_scholar_event_source_unique
 on public.coin_ledger(scholar_id,event_type,source_id);
-- Event writes remain available through the governed private command wrappers.
revoke insert,update,delete on public.community_events from public,anon,authenticated;

-- Fresh canonical replay uses the Students policy names; hosted legacy replay
-- may instead retain Users manage own ag_progress. Cache the current variant
-- without adding policies or broadening its ownership/role predicates.
do $$
begin
 if exists(select 1 from pg_policies where schemaname='public' and tablename='ag_progress' and policyname='Students can view own ag progress') then
   alter policy "Students can view own ag progress" on public.ag_progress using ((select auth.uid())=user_id);
 end if;
 if exists(select 1 from pg_policies where schemaname='public' and tablename='ag_progress' and policyname='Students can update own ag progress') then
   alter policy "Students can update own ag progress" on public.ag_progress using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
 end if;
end;
$$;

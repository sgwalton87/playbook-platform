-- Cache auth.uid() once per statement for direct-owner/creator policies.
-- These span canonical and reconciled legacy tables, so optimize only exact policies that exist.
-- Existing commands, roles, owner columns, and historical USING/WITH CHECK shapes are preserved.

do $$
begin
  if to_regclass('public.ag_progress') is not null and exists (
    select 1 from pg_policies where schemaname='public' and tablename='ag_progress' and policyname='Users manage own ag_progress'
  ) then
    execute 'alter policy "Users manage own ag_progress" on public.ag_progress using ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.college_list') is not null and exists (
    select 1 from pg_policies where schemaname='public' and tablename='college_list' and policyname='Users manage own college_list'
  ) then
    execute 'alter policy "Users manage own college_list" on public.college_list using ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.deadlines') is not null and exists (
    select 1 from pg_policies where schemaname='public' and tablename='deadlines' and policyname='Users manage own deadlines'
  ) then
    execute 'alter policy "Users manage own deadlines" on public.deadlines using ((select auth.uid()) = user_id)';
  end if;

  if to_regclass('public.playbook_records') is not null and exists (
    select 1 from pg_policies where schemaname='public' and tablename='playbook_records' and policyname='Users can manage own playbook records'
  ) then
    execute 'alter policy "Users can manage own playbook records" on public.playbook_records using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()))';
  end if;

  if to_regclass('public.onboarding_options') is not null and exists (
    select 1 from pg_policies where schemaname='public' and tablename='onboarding_options' and policyname='Users add options'
  ) then
    execute 'alter policy "Users add options" on public.onboarding_options with check ((select auth.uid()) = created_by)';
  end if;
end $$;

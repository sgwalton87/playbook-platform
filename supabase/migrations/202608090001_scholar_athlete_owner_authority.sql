-- Connect Scholar-Athlete onboarding and dashboard records without broadening
-- authority beyond the authenticated record owner.
create unique index if not exists athlete_profiles_scholar_id_unique
  on public.athlete_profiles (scholar_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'athlete_profiles',
    'athlete_eligibility_checks',
    'recruiting_targets',
    'nil_deals',
    'athlete_financial_entries'
  ] loop
    execute format('drop policy if exists %I on public.%I', table_name || '_owner_all', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (scholar_id = auth.uid()) with check (scholar_id = auth.uid())',
      table_name || '_owner_all',
      table_name
    );
  end loop;
end $$;

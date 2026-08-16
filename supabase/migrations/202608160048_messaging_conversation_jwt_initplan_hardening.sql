-- Final lint 0003 cleanup for governed conversation creation.
-- Cache the JWT object once per statement, then extract email from the cached value.
drop policy if exists "Governed actors create conversations" on public.pbos_conversations;
create policy "Governed actors create conversations"
on public.pbos_conversations for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.support_relationships r
    where r.id = relationship_id
      and r.status = 'active'
      and (
        scholar_id = (select auth.uid())
        or r.supporter_id = (select auth.uid())
        or (
          r.supporter_email is not null
          and lower(r.supporter_email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
        )
      )
  )
);

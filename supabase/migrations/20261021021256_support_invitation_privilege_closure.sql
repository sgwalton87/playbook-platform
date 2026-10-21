-- Close inherited/default table and column grants; retain governed INSERT/SELECT.
-- Claim/decline continues through the existing authenticated RPC boundary.
revoke all on public.support_invitations from public,anon,authenticated;
do $$
declare col text;
begin
  for col in select attname from pg_attribute
    where attrelid='public.support_invitations'::regclass and attnum>0 and not attisdropped
  loop
    execute format('revoke all (%I) on public.support_invitations from public,anon,authenticated',col);
  end loop;
end; $$;
grant select,insert on public.support_invitations to authenticated;

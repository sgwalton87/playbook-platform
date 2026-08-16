-- Cache stable auth.uid() inputs once per statement for high-traffic social/attention RLS policies.
--
-- These tables span both canonical and reconciled legacy surfaces. A clean canonical database may
-- legitimately omit some legacy tables (for example public.posts), while hosted production still
-- carries and serves them. Therefore each optimization is applied only when the exact table/policy
-- already exists. This migration never creates a legacy table or policy and never changes grants,
-- commands, roles, visibility rules, or authorization semantics.

do $$
begin
  if to_regclass('public.posts') is not null then
    if exists (select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='Authenticated users can create posts') then
      execute 'alter policy "Authenticated users can create posts" on public.posts with check ((select auth.uid()) = author_id)';
    end if;
    if exists (select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='Users can update own posts') then
      execute 'alter policy "Users can update own posts" on public.posts using ((select auth.uid()) = author_id)';
    end if;
    if exists (select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='Users can delete own posts') then
      execute 'alter policy "Users can delete own posts" on public.posts using ((select auth.uid()) = author_id)';
    end if;
  end if;

  if to_regclass('public.notifications') is not null then
    if exists (select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='Users can view own notifications') then
      execute 'alter policy "Users can view own notifications" on public.notifications using ((select auth.uid()) = profile_id)';
    end if;
    if exists (select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='Users can update own notifications') then
      execute 'alter policy "Users can update own notifications" on public.notifications using ((select auth.uid()) = profile_id)';
    end if;
  end if;

  if to_regclass('public.connections') is not null then
    if exists (select 1 from pg_policies where schemaname='public' and tablename='connections' and policyname='Users can view own connections') then
      execute 'alter policy "Users can view own connections" on public.connections using (((select auth.uid()) = requester_id) or ((select auth.uid()) = addressee_id))';
    end if;
    if exists (select 1 from pg_policies where schemaname='public' and tablename='connections' and policyname='Users can create connection requests') then
      execute 'alter policy "Users can create connection requests" on public.connections with check ((select auth.uid()) = requester_id)';
    end if;
  end if;

  if to_regclass('public.connection_requests') is not null then
    if exists (select 1 from pg_policies where schemaname='public' and tablename='connection_requests' and policyname='Users can view own connection requests') then
      execute 'alter policy "Users can view own connection requests" on public.connection_requests using (((select auth.uid()) = requester_id) or ((select auth.uid()) = recipient_id))';
    end if;
    if exists (select 1 from pg_policies where schemaname='public' and tablename='connection_requests' and policyname='Users can create connection requests') then
      execute 'alter policy "Users can create connection requests" on public.connection_requests with check ((select auth.uid()) = requester_id)';
    end if;
    if exists (select 1 from pg_policies where schemaname='public' and tablename='connection_requests' and policyname='Recipients can respond to connection requests') then
      execute 'alter policy "Recipients can respond to connection requests" on public.connection_requests using (((select auth.uid()) = recipient_id) or ((select auth.uid()) = requester_id)) with check (((select auth.uid()) = recipient_id) or ((select auth.uid()) = requester_id))';
    end if;
  end if;

  if to_regclass('public.user_connections') is not null then
    if exists (select 1 from pg_policies where schemaname='public' and tablename='user_connections' and policyname='Users can view own connections') then
      execute 'alter policy "Users can view own connections" on public.user_connections using (((select auth.uid()) = user_id) or ((select auth.uid()) = connected_user_id))';
    end if;
    if exists (select 1 from pg_policies where schemaname='public' and tablename='user_connections' and policyname='Users can create own connections') then
      execute 'alter policy "Users can create own connections" on public.user_connections with check ((select auth.uid()) = user_id)';
    end if;
    if exists (select 1 from pg_policies where schemaname='public' and tablename='user_connections' and policyname='Users can remove own connections') then
      execute 'alter policy "Users can remove own connections" on public.user_connections using (((select auth.uid()) = user_id) or ((select auth.uid()) = connected_user_id))';
    end if;
  end if;
end $$;

-- Governed, consent-aware, pseudonymous launch analytics.
create table if not exists public.analytics_consents (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'denied' check(status in ('granted','denied','withdrawn')),
  policy_version text not null,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.analytics_consents enable row level security;
create policy "Users govern analytics consent" on public.analytics_consents for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

create table if not exists public.launch_analytics_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null check(event_name in ('auth.signed_in','onboarding.completed','evidence.added','evidence.verification_requested','portfolio.shared','opportunity.opened','support.action_completed')),
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '13 months'
);
alter table public.launch_analytics_events enable row level security;
create index if not exists launch_analytics_events_expiry_idx on public.launch_analytics_events(expires_at);
create index if not exists launch_analytics_events_name_occurred_idx on public.launch_analytics_events(event_name,occurred_at desc);

create or replace function public.record_launch_analytics_event(p_event_name text,p_properties jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_id uuid;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not exists(select 1 from public.analytics_consents where user_id=v_actor and status='granted') then raise exception 'analytics_consent_required'; end if;
  if p_event_name not in ('auth.signed_in','onboarding.completed','evidence.added','evidence.verification_requested','portfolio.shared','opportunity.opened','support.action_completed') then raise exception 'unsupported_analytics_event'; end if;
  insert into public.launch_analytics_events(actor_id,event_name,properties) values(v_actor,p_event_name,coalesce(p_properties,'{}'::jsonb)) returning id into v_id;
  return v_id;
end; $$;
revoke all on function public.record_launch_analytics_event(text,jsonb) from public,anon;
grant execute on function public.record_launch_analytics_event(text,jsonb) to authenticated;

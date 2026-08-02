-- Persistent, horizontally safe API quotas and auditable communication delivery.
-- Direct access is denied; authenticated commands use the governed quota RPC.

create table if not exists public.api_quota_windows (
  actor_id uuid not null references public.profiles(id) on delete cascade,
  scope text not null check (length(scope) between 3 and 100),
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key(actor_id, scope, window_started_at)
);
alter table public.api_quota_windows enable row level security;
create policy "API quota windows deny direct access"
on public.api_quota_windows for all to authenticated
using (false) with check (false);

create table if not exists public.communication_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  scholar_id uuid references public.profiles(id) on delete restrict,
  relationship_id uuid references public.support_relationships(id) on delete restrict,
  command_key text not null check (length(command_key) between 16 and 120),
  channel text not null check (channel in ('email')),
  purpose text not null check (purpose in ('admin_verification','guardian_update')),
  provider text not null,
  recipient_hash text not null check (length(recipient_hash) = 64),
  provider_message_id text,
  status text not null check (status in ('pending','delivered_to_provider','failed')),
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(actor_id, purpose, command_key)
);
create index if not exists communication_delivery_actor_idx
on public.communication_delivery_attempts(actor_id, created_at desc);
alter table public.communication_delivery_attempts enable row level security;
create policy "Actors read own communication delivery attempts"
on public.communication_delivery_attempts for select to authenticated
using (actor_id = auth.uid());
create policy "Communication delivery writes deny direct access"
on public.communication_delivery_attempts for all to authenticated
using (false) with check (false);

create or replace function public.consume_api_quota(
  p_scope text,
  p_limit integer,
  p_window_seconds integer
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_actor uuid := auth.uid();
  v_window timestamptz;
  v_count integer;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if p_scope !~ '^[a-z0-9_.:-]{3,100}$' then raise exception 'invalid_quota_scope'; end if;
  if p_limit not between 1 and 1000 or p_window_seconds not between 10 and 86400 then
    raise exception 'invalid_quota_contract';
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );
  perform pg_advisory_xact_lock(hashtextextended(v_actor::text || ':' || p_scope || ':' || v_window::text, 0));

  insert into public.api_quota_windows(actor_id, scope, window_started_at, request_count)
  values(v_actor, p_scope, v_window, 1)
  on conflict(actor_id, scope, window_started_at)
  do update set request_count = public.api_quota_windows.request_count + 1, updated_at = now()
  returning request_count into v_count;

  return jsonb_build_object(
    'allowed', v_count <= p_limit,
    'remaining', greatest(p_limit - v_count, 0),
    'windowStartedAt', v_window
  );
end; $$;

revoke all on function public.consume_api_quota(text,integer,integer) from public,anon;
grant execute on function public.consume_api_quota(text,integer,integer) to authenticated;

create or replace function public.begin_communication_delivery(
  p_command_key text,
  p_purpose text,
  p_relationship_id uuid,
  p_provider text,
  p_recipient_hash text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_attempt public.communication_delivery_attempts%rowtype;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if length(coalesce(p_command_key,'')) not between 16 and 120 then raise exception 'invalid_idempotency_key'; end if;
  if p_purpose not in ('admin_verification','guardian_update') then raise exception 'invalid_delivery_purpose'; end if;
  if p_recipient_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid_recipient_hash'; end if;
  if p_purpose='guardian_update' and not exists(
    select 1 from public.support_relationships relationship
    where relationship.id=p_relationship_id and relationship.scholar_id=v_actor
      and relationship.status='active' and lower(relationship.relationship) in ('parent','guardian','family')
  ) then raise exception 'active_guardian_relationship_required'; end if;
  if p_purpose='admin_verification' and p_relationship_id is not null then raise exception 'relationship_not_allowed'; end if;

  insert into public.communication_delivery_attempts(
    actor_id,scholar_id,relationship_id,command_key,channel,purpose,provider,recipient_hash,status
  ) values(v_actor,v_actor,p_relationship_id,p_command_key,'email',p_purpose,p_provider,p_recipient_hash,'pending')
  on conflict(actor_id,purpose,command_key) do nothing returning * into v_attempt;
  if v_attempt.id is null then
    select * into v_attempt from public.communication_delivery_attempts
    where actor_id=v_actor and purpose=p_purpose and command_key=p_command_key;
    return jsonb_build_object('attemptId',v_attempt.id,'created',false,'status',v_attempt.status);
  end if;
  return jsonb_build_object('attemptId',v_attempt.id,'created',true,'status',v_attempt.status);
end; $$;

create or replace function public.finish_communication_delivery(
  p_attempt_id uuid,
  p_status text,
  p_provider_message_id text,
  p_error_code text
) returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if p_status not in ('delivered_to_provider','failed') then raise exception 'invalid_delivery_status'; end if;
  update public.communication_delivery_attempts set
    status=p_status,
    provider_message_id=nullif(trim(p_provider_message_id),''),
    error_code=nullif(trim(p_error_code),''),
    updated_at=now()
  where id=p_attempt_id and actor_id=auth.uid() and status='pending';
  if not found then raise exception 'pending_delivery_attempt_required'; end if;
end; $$;

revoke all on function public.begin_communication_delivery(text,text,uuid,text,text) from public,anon;
grant execute on function public.begin_communication_delivery(text,text,uuid,text,text) to authenticated;
revoke all on function public.finish_communication_delivery(uuid,text,text,text) from public,anon;
grant execute on function public.finish_communication_delivery(uuid,text,text,text) to authenticated;

create table if not exists public.ai_processing_consents (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null check (status in ('granted','denied','withdrawn')),
  policy_version text not null default 'ai-guidance-v1',
  granted_at timestamptz,
  withdrawn_at timestamptz,
  updated_at timestamptz not null default now(),
  check (status <> 'granted' or granted_at is not null)
);
alter table public.ai_processing_consents enable row level security;
create policy "Users read own AI processing consent"
on public.ai_processing_consents for select to authenticated using(user_id=auth.uid());
create policy "Users create own AI processing consent"
on public.ai_processing_consents for insert to authenticated with check(user_id=auth.uid());
create policy "Users update own AI processing consent"
on public.ai_processing_consents for update to authenticated
using(user_id=auth.uid()) with check(user_id=auth.uid());

create table if not exists public.ai_guidance_runs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  provider text not null,
  model text not null,
  policy_version text not null,
  prompt_hash text not null check (length(prompt_hash)=64),
  output_hash text check (output_hash is null or length(output_hash)=64),
  status text not null check (status in ('pending','completed','failed')),
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '13 months')
);
create index if not exists ai_guidance_runs_actor_idx on public.ai_guidance_runs(actor_id,created_at desc);
create index if not exists ai_guidance_runs_expiry_idx on public.ai_guidance_runs(expires_at);
alter table public.ai_guidance_runs enable row level security;
create policy "Users read own AI guidance provenance"
on public.ai_guidance_runs for select to authenticated using(actor_id=auth.uid());
create policy "AI guidance provenance writes deny direct access"
on public.ai_guidance_runs for all to authenticated using(false) with check(false);

create or replace function public.begin_ai_guidance_run(p_prompt_hash text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_id uuid;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if p_prompt_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid_prompt_hash'; end if;
  if not exists(select 1 from public.ai_processing_consents consent where consent.user_id=v_actor and consent.status='granted' and consent.policy_version='ai-guidance-v1') then
    raise exception 'ai_processing_consent_required';
  end if;
  insert into public.ai_guidance_runs(actor_id,provider,model,policy_version,prompt_hash,status)
  values(v_actor,'zai','glm-5.2','ai-guidance-v1',p_prompt_hash,'pending') returning id into v_id;
  return v_id;
end; $$;

create or replace function public.finish_ai_guidance_run(
  p_run_id uuid,p_status text,p_output_hash text,p_error_code text
) returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if p_status not in ('completed','failed') then raise exception 'invalid_ai_run_status'; end if;
  if p_output_hash <> '' and p_output_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid_output_hash'; end if;
  update public.ai_guidance_runs set status=p_status,output_hash=nullif(p_output_hash,''),
    error_code=nullif(p_error_code,''),completed_at=now()
  where id=p_run_id and actor_id=auth.uid() and status='pending';
  if not found then raise exception 'pending_ai_guidance_run_required'; end if;
end; $$;

revoke all on function public.begin_ai_guidance_run(text) from public,anon;
grant execute on function public.begin_ai_guidance_run(text) to authenticated;
revoke all on function public.finish_ai_guidance_run(uuid,text,text,text) from public,anon;
grant execute on function public.finish_ai_guidance_run(uuid,text,text,text) to authenticated;

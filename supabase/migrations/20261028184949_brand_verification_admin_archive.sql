-- Retained Brand Partner evidence. End users can upload and see receipts;
-- only stored Founder/Admin roles can open contents. Archiving never deletes bytes.
create table public.brand_verification_document_archives (
  document_id uuid primary key references storage.objects(id) on delete restrict,
  archived_at timestamptz not null default now(),
  archived_by uuid not null,
  reason text not null check (length(trim(reason)) between 1 and 2000)
);
alter table public.brand_verification_document_archives enable row level security;
revoke all on public.brand_verification_document_archives from public, anon, authenticated;
grant select on public.brand_verification_document_archives to authenticated;
create policy brand_document_archives_admin_read on public.brand_verification_document_archives
for select to authenticated using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('founder','admin')));

create table public.brand_verification_document_events (
  id uuid primary key default gen_random_uuid(), document_id uuid not null,
  actor_id uuid not null, action text not null check (action in ('open_requested','archived')),
  reason text, created_at timestamptz not null default now()
);
create index brand_document_events_document_time on public.brand_verification_document_events(document_id, created_at desc);
alter table public.brand_verification_document_events enable row level security;
revoke all on public.brand_verification_document_events from public, anon, authenticated;
grant select on public.brand_verification_document_events to authenticated;
create policy brand_document_events_admin_read on public.brand_verification_document_events
for select to authenticated using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('founder','admin')));

-- A restrictive policy also closes any unrelated permissive bucket policies.
drop policy if exists brand_evidence_owner_delete on storage.objects;
create policy brand_evidence_no_user_delete on storage.objects as restrictive
for delete to authenticated using (bucket_id <> 'brand-verification-evidence');
create policy brand_evidence_no_user_replace on storage.objects as restrictive
for update to authenticated using (bucket_id <> 'brand-verification-evidence')
with check (bucket_id <> 'brand-verification-evidence');

create function private.retain_brand_verification_document()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if old.bucket_id='brand-verification-evidence'
    and (TG_OP='DELETE' or new.name is distinct from old.name or new.bucket_id is distinct from old.bucket_id) then
  raise exception 'Verification documents are retained; archive instead of deleting or moving' using errcode='23514';
 end if;
 if TG_OP='DELETE' then return old; end if;
 return new;
end;
$$;
revoke all on function private.retain_brand_verification_document() from public,anon,authenticated;
create trigger retain_brand_verification_document before delete or update of name,bucket_id on storage.objects
for each row execute function private.retain_brand_verification_document();

-- Owner-scoped receipt metadata, never object download authority.
create function private.get_own_brand_verification_documents()
returns table(name text, archived boolean)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists (
  select 1 from public.profiles p where p.id=auth.uid() and coalesce(p.profile_mode,p.role)='brand-partner'
 ) then raise exception 'Brand Partner identity required' using errcode='42501'; end if;
 return query select split_part(o.name,'/',2), a.document_id is not null
 from storage.objects o left join public.brand_verification_document_archives a on a.document_id=o.id
 where o.bucket_id='brand-verification-evidence' and split_part(o.name,'/',1)=auth.uid()::text
 and o.name ~ '^[0-9a-f-]{36}/(letterhead|business-card)-[0-9a-f-]+\.(pdf|png|jpg|webp)$'
 order by o.created_at desc;
end;
$$;
create function public.get_own_brand_verification_documents()
returns table(name text, archived boolean)
language sql stable security invoker set search_path='' as $$
 select * from private.get_own_brand_verification_documents();
$$;

-- Library is independent of the open review queue, so approval/rejection never hides retained files.
create function private.get_brand_verification_documents(
 requested_request_id uuid default null, requested_archived boolean default false, requested_offset integer default 0
)
returns table(document_id uuid, storage_path text, document_type text, uploaded_at timestamptz,
 request_id uuid, organization_name text, verification_status text, submitted_at timestamptz,
 archived_at timestamptz, archive_reason text)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then
  raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 if requested_offset < 0 then raise exception 'Invalid document page' using errcode='22023'; end if;
 return query
 select o.id, o.name, case when split_part(o.name,'/',2) like 'letterhead-%' then 'Company letterhead' else 'Business card' end,
 o.created_at::timestamptz, r.id, r.organization_name, r.status, r.submitted_at, a.archived_at, a.reason
 from storage.objects o
 left join public.brand_partner_verification_requests r on r.brand_user_id::text=split_part(o.name,'/',1)
 left join public.brand_verification_document_archives a on a.document_id=o.id
 where o.bucket_id='brand-verification-evidence'
 and o.name ~ '^[0-9a-f-]{36}/(letterhead|business-card)-[0-9a-f-]+\.(pdf|png|jpg|webp)$'
 and (requested_request_id is null or r.id=requested_request_id)
 and ((a.document_id is not null)=requested_archived)
 order by o.created_at desc, o.id limit 100 offset requested_offset;
end;
$$;
create function public.get_brand_verification_documents(
 requested_request_id uuid default null, requested_archived boolean default false, requested_offset integer default 0
)
returns table(document_id uuid, storage_path text, document_type text, uploaded_at timestamptz,
 request_id uuid, organization_name text, verification_status text, submitted_at timestamptz,
 archived_at timestamptz, archive_reason text)
language sql stable security invoker set search_path='' as $$
 select * from private.get_brand_verification_documents(requested_request_id,requested_archived,requested_offset);
$$;

create function private.open_brand_verification_document(requested_document_id uuid)
returns text language plpgsql security definer set search_path='' as $$
declare object_path text;
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then
  raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 select o.name into object_path from storage.objects o where o.id=requested_document_id
 and o.bucket_id='brand-verification-evidence'
 and o.name ~ '^[0-9a-f-]{36}/(letterhead|business-card)-[0-9a-f-]+\.(pdf|png|jpg|webp)$';
 if object_path is null then raise exception 'Document not found' using errcode='P0002'; end if;
 insert into public.brand_verification_document_events(document_id,actor_id,action)
 values(requested_document_id,auth.uid(),'open_requested');
 return object_path;
end;
$$;
create function public.open_brand_verification_document(requested_document_id uuid)
returns text language sql security invoker set search_path='' as $$
 select private.open_brand_verification_document(requested_document_id);
$$;

create function private.archive_brand_verification_document(requested_document_id uuid, requested_reason text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then
  raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 if requested_reason is null or length(trim(requested_reason)) not between 1 and 2000 then
  raise exception 'An archive reason of 1 to 2000 characters is required' using errcode='22023'; end if;
 perform 1 from storage.objects o where o.id=requested_document_id and o.bucket_id='brand-verification-evidence'
 and o.name ~ '^[0-9a-f-]{36}/(letterhead|business-card)-[0-9a-f-]+\.(pdf|png|jpg|webp)$' for update;
 if not found then raise exception 'Document not found' using errcode='P0002'; end if;
 insert into public.brand_verification_document_archives(document_id,archived_by,reason)
 values(requested_document_id,auth.uid(),trim(requested_reason)) on conflict(document_id) do nothing;
 if found then
  insert into public.brand_verification_document_events(document_id,actor_id,action,reason)
  values(requested_document_id,auth.uid(),'archived',trim(requested_reason));
 end if;
end;
$$;
create function public.archive_brand_verification_document(requested_document_id uuid, requested_reason text)
returns void language sql security invoker set search_path='' as $$
 select private.archive_brand_verification_document(requested_document_id,requested_reason);
$$;

revoke all on function private.get_own_brand_verification_documents() from public,anon,authenticated;
revoke all on function public.get_own_brand_verification_documents() from public,anon,authenticated;
revoke all on function private.get_brand_verification_documents(uuid,boolean,integer) from public,anon,authenticated;
revoke all on function public.get_brand_verification_documents(uuid,boolean,integer) from public,anon,authenticated;
revoke all on function private.open_brand_verification_document(uuid) from public,anon,authenticated;
revoke all on function public.open_brand_verification_document(uuid) from public,anon,authenticated;
revoke all on function private.archive_brand_verification_document(uuid,text) from public,anon,authenticated;
revoke all on function public.archive_brand_verification_document(uuid,text) from public,anon,authenticated;
grant execute on function private.get_own_brand_verification_documents(),public.get_own_brand_verification_documents(),
 private.get_brand_verification_documents(uuid,boolean,integer),public.get_brand_verification_documents(uuid,boolean,integer),
 private.open_brand_verification_document(uuid),public.open_brand_verification_document(uuid),
 private.archive_brand_verification_document(uuid,text),public.archive_brand_verification_document(uuid,text) to authenticated;

-- Archived evidence is kept, but cannot support a new approval.
create or replace function private.require_brand_partner_evidence_before_approval()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='approved' and (TG_OP='INSERT' or old.status is distinct from 'approved') then
  if not exists (
   select 1 from storage.objects o where o.bucket_id='brand-verification-evidence'
   and o.name ~ ('^'||new.brand_user_id::text||'/(letterhead|business-card)-[0-9a-f-]+\.(pdf|png|jpg|webp)$')
   and not exists (select 1 from public.brand_verification_document_archives a where a.document_id=o.id)
  ) then raise exception 'Active company letterhead or business card evidence is required before approval' using errcode='23514'; end if;
 end if;
 return new;
end;
$$;
revoke all on function private.require_brand_partner_evidence_before_approval() from public,anon,authenticated;

-- Community Partner private verification documents. Distinct from Brand Partner evidence.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('community-verification-evidence','community-verification-evidence',false,5242880,array['application/pdf','image/png','image/jpeg','image/webp'])
on conflict(id) do nothing;

create policy "community_partner_evidence_owner_insert" on storage.objects
for insert to authenticated with check (
 bucket_id='community-verification-evidence'
 and (storage.foldername(name))[1]=auth.uid()::text
 and exists(select 1 from public.profiles p where p.id=auth.uid() and coalesce(p.profile_mode,p.role)='other')
);
create policy "community_partner_evidence_owner_list" on storage.objects
for select to authenticated using (
 bucket_id='community-verification-evidence'
 and (storage.foldername(name))[1]=auth.uid()::text
 and exists(select 1 from public.profiles p where p.id=auth.uid() and coalesce(p.profile_mode,p.role)='other')
);

-- Returns only filenames, never private file contents. Submission must be checked on the server.
create or replace function public.get_own_community_verification_documents()
returns table(name text)
language sql security definer set search_path=public,storage
as $$
 select o.name from storage.objects o
 where o.bucket_id='community-verification-evidence'
 and (storage.foldername(o.name))[1]=auth.uid()::text
 and coalesce(o.metadata->>'mimetype','') in ('application/pdf','image/png','image/jpeg','image/webp')
$$;
revoke all on function public.get_own_community_verification_documents() from public;
grant execute on function public.get_own_community_verification_documents() to authenticated;

-- Existing documentless pending requests must not be approved until evidence is added.
create or replace function private.require_community_partner_evidence_before_approval()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='approved' or new.service_scope_status='approved' then
  if not exists(
    select 1 from storage.objects o
    where o.bucket_id='community-verification-evidence'
      and (storage.foldername(o.name))[1]=new.partner_user_id::text
      and o.name ~ ('^' || new.partner_user_id::text || '/organization-[a-f0-9-]+[.](pdf|png|jpg|webp)$')
  ) then
   raise exception 'Community Partner verification requires uploaded evidence before approval' using errcode='23514';
  end if;
 end if;
 return new;
end $$;
revoke all on function private.require_community_partner_evidence_before_approval() from public, anon, authenticated;
drop trigger if exists require_community_partner_evidence_before_approval on public.community_partner_verification_requests;
create trigger require_community_partner_evidence_before_approval
before update of status,service_scope_status on public.community_partner_verification_requests
for each row execute function private.require_community_partner_evidence_before_approval();

-- Reviewer access is separate from the applicant-owned receipt.
create policy "community_verification_authorized_reviewer_read" on storage.objects
for select to authenticated using (
 bucket_id='community-verification-evidence' and exists(
 select 1 from public.profiles p where p.id=auth.uid() and p.role in ('founder','admin')
 )
);

-- Application Workspace authority hardening.
-- Shared application capabilities are learner-only and must preserve owner lineage
-- even when callers bypass Next.js and use the Supabase Data/Storage APIs directly.

create or replace function private.current_user_is_onboarded_learner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.profiles
     where id = auth.uid()
       and coalesce(profile_mode, role) in ('scholar', 'scholar-athlete', 'transition-youth')
       and onboarding_completed is true
  );
$$;

revoke all on function private.current_user_is_onboarded_learner() from public;
revoke all on function private.current_user_is_onboarded_learner() from anon;
revoke all on function private.current_user_is_onboarded_learner() from authenticated;

-- Parent workspace: owner + durable learner authority.
drop policy if exists "application-workspaces-own" on public.application_workspaces;
create policy "application-workspaces-own"
on public.application_workspaces
for all
to authenticated
using (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
)
with check (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
);

-- Child records must belong to the authenticated learner AND to that learner's
-- canonical parent workspace. This prevents cross-workspace foreign-key pollution.
drop policy if exists "application-tasks-own" on public.application_workspace_tasks;
create policy "application-tasks-own"
on public.application_workspace_tasks
for all
to authenticated
using (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
  and exists (
    select 1 from public.application_workspaces workspace
     where workspace.id = application_workspace_tasks.workspace_id
       and workspace.scholar_id = (select auth.uid())
  )
)
with check (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
  and exists (
    select 1 from public.application_workspaces workspace
     where workspace.id = application_workspace_tasks.workspace_id
       and workspace.scholar_id = (select auth.uid())
  )
);

drop policy if exists "application-documents-own" on public.application_workspace_documents;
create policy "application-documents-own"
on public.application_workspace_documents
for all
to authenticated
using (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
  and exists (
    select 1 from public.application_workspaces workspace
     where workspace.id = application_workspace_documents.workspace_id
       and workspace.scholar_id = (select auth.uid())
  )
)
with check (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
  and exists (
    select 1 from public.application_workspaces workspace
     where workspace.id = application_workspace_documents.workspace_id
       and workspace.scholar_id = (select auth.uid())
  )
);

drop policy if exists "application-events-own" on public.application_workspace_events;
create policy "application-events-own"
on public.application_workspace_events
for all
to authenticated
using (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
  and exists (
    select 1 from public.application_workspaces workspace
     where workspace.id = application_workspace_events.workspace_id
       and workspace.scholar_id = (select auth.uid())
  )
)
with check (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
  and exists (
    select 1 from public.application_workspaces workspace
     where workspace.id = application_workspace_events.workspace_id
       and workspace.scholar_id = (select auth.uid())
  )
);

-- Storage is private, owner-scoped, and learner-gated. The second path segment
-- is the workspace ID and must resolve to a workspace owned by the same learner.
drop policy if exists "application-document-storage-own" on storage.objects;
create policy "application-document-storage-own"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'application-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.current_user_is_onboarded_learner())
  and exists (
    select 1 from public.application_workspaces workspace
     where workspace.id::text = (storage.foldername(name))[2]
       and workspace.scholar_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'application-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.current_user_is_onboarded_learner())
  and exists (
    select 1 from public.application_workspaces workspace
     where workspace.id::text = (storage.foldername(name))[2]
       and workspace.scholar_id = (select auth.uid())
  )
);

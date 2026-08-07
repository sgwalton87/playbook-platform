create table if not exists public.application_workspaces (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references auth.users(id),
  opportunity_name text not null,
  opportunity_type text not null,
  deadline date,
  requirements jsonb not null default '[]'::jsonb,
  resume_version jsonb,
  essays jsonb not null default '[]'::jsonb,
  recommendation_request_ids jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  status text not null default 'building' check (status in ('building','ready','submitted','archived')),
  created_at timestamptz not null default now()
);
alter table public.application_workspaces enable row level security;
drop policy if exists "application-workspaces-own" on public.application_workspaces;
create policy "application-workspaces-own" on public.application_workspaces for all to authenticated
  using (auth.uid() = scholar_id) with check (auth.uid() = scholar_id);

alter table public.application_workspaces add column if not exists opportunity_id text;
alter table public.application_workspaces add column if not exists idempotency_key text;
alter table public.application_workspaces add column if not exists delivery_state text not null default 'PENDING' check (delivery_state in ('PENDING','DELIVERED'));
alter table public.application_workspaces add column if not exists provenance jsonb not null default '[]'::jsonb;
alter table public.application_workspaces add column if not exists updated_at timestamptz not null default now();
create unique index if not exists application_workspace_idempotency_idx on public.application_workspaces(scholar_id,idempotency_key);

create table if not exists public.application_workspace_tasks (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.application_workspaces(id) on delete cascade,
  scholar_id uuid not null references auth.users(id), task_key text not null, title text not null, due_at date,
  status text not null default 'TODO' check (status in ('TODO','COMPLETE')), completed_at timestamptz,
  provenance jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(workspace_id,task_key)
);
create table if not exists public.application_workspace_documents (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.application_workspaces(id) on delete cascade,
  scholar_id uuid not null references auth.users(id), file_name text not null, storage_path text not null unique,
  media_type text not null, size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760), created_at timestamptz not null default now()
);
create table if not exists public.application_workspace_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.application_workspaces(id) on delete cascade,
  scholar_id uuid not null references auth.users(id), event_type text not null, idempotency_key text not null,
  delivery_state text not null check (delivery_state in ('PENDING','DELIVERED')), provenance jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), unique(scholar_id,idempotency_key)
);

alter table public.application_workspace_tasks enable row level security;
alter table public.application_workspace_documents enable row level security;
alter table public.application_workspace_events enable row level security;
drop policy if exists "application-tasks-own" on public.application_workspace_tasks;
create policy "application-tasks-own" on public.application_workspace_tasks for all to authenticated using (auth.uid() = scholar_id) with check (auth.uid() = scholar_id);
drop policy if exists "application-documents-own" on public.application_workspace_documents;
create policy "application-documents-own" on public.application_workspace_documents for all to authenticated using (auth.uid() = scholar_id) with check (auth.uid() = scholar_id);
drop policy if exists "application-events-own" on public.application_workspace_events;
create policy "application-events-own" on public.application_workspace_events for all to authenticated using (auth.uid() = scholar_id) with check (auth.uid() = scholar_id);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('application-documents','application-documents',false,10485760,
  array['application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document']) on conflict (id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "application-document-storage-own" on storage.objects;
create policy "application-document-storage-own" on storage.objects for all to authenticated
  using (bucket_id='application-documents' and (storage.foldername(name))[1]=auth.uid()::text)
  with check (bucket_id='application-documents' and (storage.foldername(name))[1]=auth.uid()::text);

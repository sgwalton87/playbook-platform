create table if not exists public.academic_transcript_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null unique,
  file_name text not null,
  media_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  sha256 text not null,
  storage_bucket text not null default 'academic-transcripts',
  storage_path text not null,
  parsing_mode text not null,
  parsed_payload jsonb not null default '{}'::jsonb,
  status text not null default 'REVIEW_REQUIRED' check (status in ('REVIEW_REQUIRED','CONFIRMED','REJECTED')),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, sha256)
);

create index if not exists academic_transcript_submissions_owner_created_idx
  on public.academic_transcript_submissions(owner_id, created_at desc);

alter table public.academic_transcript_submissions enable row level security;

drop policy if exists "Scholars manage own transcript submissions" on public.academic_transcript_submissions;
create policy "Scholars manage own transcript submissions"
on public.academic_transcript_submissions
for all to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create table if not exists public.academic_transcript_course_evidence (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null references public.academic_transcript_submissions(id) on delete cascade,
  ag_category text not null check (ag_category in ('A','B','C','D','E','F','G')),
  course_name text not null,
  completion_state text not null check (completion_state in ('COMPLETED','IN_PROGRESS')),
  years_credit numeric not null default 0 check (years_credit >= 0),
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(submission_id, ag_category, course_name, completion_state)
);

create index if not exists academic_transcript_course_evidence_owner_idx
  on public.academic_transcript_course_evidence(owner_id, submission_id);

alter table public.academic_transcript_course_evidence enable row level security;

drop policy if exists "Scholars manage own transcript course evidence" on public.academic_transcript_course_evidence;
create policy "Scholars manage own transcript course evidence"
on public.academic_transcript_course_evidence
for all to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'academic-transcripts',
  'academic-transcripts',
  false,
  12582912,
  array['application/pdf','image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Scholars upload own academic transcripts" on storage.objects;
create policy "Scholars upload own academic transcripts"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'academic-transcripts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Scholars read own academic transcripts" on storage.objects;
create policy "Scholars read own academic transcripts"
on storage.objects for select to authenticated
using (
  bucket_id = 'academic-transcripts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Scholars delete own academic transcripts" on storage.objects;
create policy "Scholars delete own academic transcripts"
on storage.objects for delete to authenticated
using (
  bucket_id = 'academic-transcripts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

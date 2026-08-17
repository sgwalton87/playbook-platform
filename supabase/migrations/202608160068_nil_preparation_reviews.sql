-- NIL Preparation review convergence.
--
-- This table owns only the Scholar's explicit preparation review/reflection.
-- Profile, social links, learning progress, media/evidence, and NIL deal state
-- remain owned by their existing canonical services and are never copied here.

create table if not exists public.nil_preparation_reviews (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  dimension text not null check (dimension in (
    'personal_brand',
    'financial_literacy',
    'contract_awareness',
    'compliance_awareness',
    'media_kit',
    'social_professionalism',
    'opportunity_tracking'
  )),
  review_status text not null default 'not_started' check (review_status in (
    'not_started', 'in_progress', 'reviewed', 'action_needed'
  )),
  reflection text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scholar_id, dimension),
  check (reflection is null or length(reflection) <= 4000),
  check (
    (review_status = 'reviewed' and reviewed_at is not null)
    or (review_status <> 'reviewed')
  )
);

create index if not exists nil_preparation_reviews_scholar_idx
  on public.nil_preparation_reviews(scholar_id, dimension);

alter table public.nil_preparation_reviews enable row level security;

grant select, insert, update, delete on public.nil_preparation_reviews to authenticated;

drop policy if exists "Scholars own NIL preparation reviews"
  on public.nil_preparation_reviews;
create policy "Scholars own NIL preparation reviews"
on public.nil_preparation_reviews
for all
to authenticated
using ((select auth.uid()) = scholar_id)
with check (
  (select auth.uid()) = scholar_id
  and exists (
    select 1
      from public.profiles p
     where p.id = (select auth.uid())
       and replace(
         lower(coalesce(
           nullif(trim(p.profile_mode), ''),
           nullif(trim(p.role::text), ''),
           nullif(trim(p.requested_role), '')
         )),
         '_',
         '-'
       ) in ('scholar', 'scholar-athlete', 'transition-youth')
  )
);

create or replace function private.set_nil_preparation_review_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.review_status = 'reviewed' then
    new.reviewed_at := coalesce(new.reviewed_at, now());
  else
    new.reviewed_at := null;
  end if;
  return new;
end;
$$;

revoke all on function private.set_nil_preparation_review_timestamps()
  from public, anon, authenticated;

drop trigger if exists nil_preparation_review_timestamps
  on public.nil_preparation_reviews;
create trigger nil_preparation_review_timestamps
before insert or update on public.nil_preparation_reviews
for each row execute function private.set_nil_preparation_review_timestamps();

comment on table public.nil_preparation_reviews is
  'Scholar-owned NIL preparation self-review only. It is not legal, tax, school, conference, governing-body, brand-safety, or compliance certification.';

-- Hosted college_list retained the original reach/match/safety/dream check.
-- Preserve every admitted value and admit the canonical UI provenance values.
-- Reject unknown constraint shapes rather than weakening unrelated checks.
do $converge$
declare definition text;
begin
  select pg_get_constraintdef(oid) into definition from pg_constraint
    where conrelid='public.college_list'::regclass and conname='college_list_college_type_check';
  if definition = 'CHECK ((college_type = ANY (ARRAY[''reach''::text, ''match''::text, ''safety''::text, ''dream''::text])))' then
    alter table public.college_list drop constraint college_list_college_type_check;
    alter table public.college_list add constraint college_list_college_type_check
      check (college_type in ('reach','match','safety','dream','manual','catalog','saved','legacy'));
  elsif definition is not null and definition <>
    'CHECK ((college_type = ANY (ARRAY[''reach''::text, ''match''::text, ''safety''::text, ''dream''::text, ''manual''::text, ''catalog''::text, ''saved''::text, ''legacy''::text])))' then
    raise exception 'Unrecognized college provenance constraint requires review';
  end if;
end;
$converge$;

-- Preserve college_list as the single college-planning authority while separating
-- school provenance (`college_type`) from independent user priority signals.

alter table public.college_list
  add column if not exists is_dream boolean not null default false,
  add column if not exists is_top boolean not null default false;

-- Converge the first Dream Schools implementation, which temporarily reused
-- college_type as a priority flag. Retain the Dream state while restoring
-- college_type to a non-priority provenance value.
update public.college_list
set
  is_dream = true,
  college_type = case
    when notes like 'Legacy dream school id:%'
      or notes = 'Migrated from legacy profile dream-school preference.'
      then 'legacy'
    else 'saved'
  end
where college_type = 'dream';

create index if not exists college_list_user_dream_idx
  on public.college_list(user_id)
  where is_dream;

create index if not exists college_list_user_top_idx
  on public.college_list(user_id)
  where is_top;

comment on column public.college_list.is_dream is
  'Scholar-controlled aspirational priority flag; does not replace college_list ownership.';
comment on column public.college_list.is_top is
  'Scholar-controlled best-fit priority flag; independent from Dream School priority.';

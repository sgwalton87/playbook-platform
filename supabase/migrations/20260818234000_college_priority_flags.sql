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

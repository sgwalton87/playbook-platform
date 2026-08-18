-- Dream Schools are a priority state on the canonical college_list record.
-- Preserve legacy profile preference fields for compatibility/read projection,
-- while converging active planning authority on college_list.

create table if not exists public.college_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_name text not null,
  college_type text,
  status text not null default 'considering',
  deadline date,
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists college_list_user_name_unique
  on public.college_list(user_id, college_name);

insert into public.college_list (user_id, college_name, college_type, status, notes)
select
  p.id,
  trim(coalesce(nullif(p.dream_school_name, ''), nullif(p.dream_school, ''))),
  'dream',
  'considering',
  case
    when nullif(trim(coalesce(p.dream_school_id, '')), '') is not null
      then 'Legacy dream school id: ' || trim(p.dream_school_id)
    else 'Migrated from legacy profile dream-school preference.'
  end
from public.profiles p
where nullif(trim(coalesce(p.dream_school_name, p.dream_school, '')), '') is not null
on conflict (user_id, college_name) do update
set college_type = case
  when public.college_list.college_type is null
    or public.college_list.college_type in ('manual', 'catalog', 'saved')
    then 'dream'
  else public.college_list.college_type
end;

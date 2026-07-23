alter table public.support_relationships
add column if not exists destination text;

create unique index if not exists support_relationships_source_invitation_unique
on public.support_relationships(source_invitation_id);

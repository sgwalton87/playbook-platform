alter table public.ag_progress
add constraint ag_progress_user_subject_unique unique (user_id, subject);

alter table public.ag_progress enable row level security;

drop policy if exists "Students can view own ag progress" on public.ag_progress;
create policy "Students can view own ag progress"
on public.ag_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Students can update own ag progress" on public.ag_progress;
create policy "Students can update own ag progress"
on public.ag_progress
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

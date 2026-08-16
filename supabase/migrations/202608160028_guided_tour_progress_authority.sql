-- Guided-tour progress is a user-owned derived experience record.
-- One canonical row exists per user and direct Data API access is owner-scoped.

create unique index if not exists guided_tour_progress_user_idx
  on public.guided_tour_progress(user_id);

drop policy if exists "Users manage own guided tour progress" on public.guided_tour_progress;
create policy "Users manage own guided tour progress"
on public.guided_tour_progress
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.guided_tour_progress to authenticated;

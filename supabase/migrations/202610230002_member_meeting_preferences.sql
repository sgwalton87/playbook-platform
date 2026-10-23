-- Private owner-managed meeting-room preference, not a public directory of meeting rooms.
create table if not exists public.member_meeting_preferences (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'zoom' check (provider in ('zoom','meet','teams','other')),
  meeting_url text not null check (length(meeting_url) <= 1500 and meeting_url ~ '^https://'),
  label text not null default 'My meeting room' check (length(label) <= 100),
  updated_at timestamptz not null default now()
);
alter table public.member_meeting_preferences enable row level security;
revoke all on public.member_meeting_preferences from anon;
grant select, insert, update, delete on public.member_meeting_preferences to authenticated;
create policy "Meeting links readable only by owner" on public.member_meeting_preferences
 for select to authenticated using (owner_id = (select auth.uid()));
create policy "Meeting links created only by owner" on public.member_meeting_preferences
 for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Meeting links updated only by owner" on public.member_meeting_preferences
 for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Meeting links deleted only by owner" on public.member_meeting_preferences
 for delete to authenticated using (owner_id = (select auth.uid()));
-- Sharing still requires a separately authorized conversation. Never expose the stored URL
-- in profile search, public member projections, or automatically to unrelated scholars.

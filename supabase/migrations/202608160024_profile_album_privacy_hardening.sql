-- Profile album privacy and parent/child ownership hardening.

-- Public albums may be read by authenticated users; private albums only by owner.
drop policy if exists "Users can read public albums" on public.profile_albums;
create policy "Users can read public albums"
on public.profile_albums
for select
to authenticated
using (visibility = 'public' or user_id = (select auth.uid()));

-- Album mutations remain owner-only.
drop policy if exists "Users manage own albums" on public.profile_albums;
create policy "Users manage own albums"
on public.profile_albums
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Photos inherit parent album visibility. `using (true)` is prohibited because it
-- exposes photos attached to private albums.
drop policy if exists "Users can read album photos" on public.profile_album_photos;
create policy "Users can read album photos"
on public.profile_album_photos
for select
to authenticated
using (
  exists (
    select 1
      from public.profile_albums album
     where album.id = profile_album_photos.album_id
       and album.user_id = profile_album_photos.user_id
       and (album.visibility = 'public' or album.user_id = (select auth.uid()))
  )
);

-- Photo mutations require both authenticated ownership and matching parent owner.
drop policy if exists "Users manage own album photos" on public.profile_album_photos;
create policy "Users manage own album photos"
on public.profile_album_photos
for all
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.profile_albums album
     where album.id = profile_album_photos.album_id
       and album.user_id = (select auth.uid())
       and album.user_id = profile_album_photos.user_id
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.profile_albums album
     where album.id = profile_album_photos.album_id
       and album.user_id = (select auth.uid())
       and album.user_id = profile_album_photos.user_id
  )
);

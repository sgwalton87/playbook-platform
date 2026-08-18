\set ON_ERROR_STOP on

begin;

create temporary table feed_edit_delete_test_ids (
  owner_id uuid,
  other_id uuid,
  post_id uuid,
  comment_id uuid,
  reaction_id uuid,
  share_id uuid
) on commit drop;

do $$
declare
  owner_id uuid := gen_random_uuid();
  other_id uuid := gen_random_uuid();
  post_id uuid := gen_random_uuid();
  comment_id uuid := gen_random_uuid();
  reaction_id uuid := gen_random_uuid();
  share_id uuid := gen_random_uuid();
begin
  insert into auth.users(id,email) values
    (owner_id, 'feed-edit-owner@example.invalid'),
    (other_id, 'feed-edit-other@example.invalid');

  insert into public.profiles(id,username) values
    (owner_id, 'feed_edit_owner'),
    (other_id, 'feed_edit_other');

  insert into public.feed_posts(id,user_id,post_type,body,visibility)
  values(post_id,owner_id,'community','Original story','public');

  insert into public.feed_post_comments(id,post_id,user_id,body)
  values(comment_id,post_id,other_id,'Dependent comment');

  insert into public.feed_post_reactions(id,post_id,user_id,reaction)
  values(reaction_id,post_id,other_id,'like');

  insert into public.feed_post_shares(id,post_id,user_id,channel)
  values(share_id,post_id,other_id,'copy_link');

  insert into feed_edit_delete_test_ids values(owner_id,other_id,post_id,comment_id,reaction_id,share_id);
end $$;

-- Direct UPDATE/DELETE remain unavailable to authenticated users.
do $$
begin
  if has_table_privilege('authenticated','public.feed_posts','UPDATE') then
    raise exception 'authenticated must not receive direct feed_posts UPDATE';
  end if;
  if has_table_privilege('authenticated','public.feed_posts','DELETE') then
    raise exception 'authenticated must not receive direct feed_posts DELETE';
  end if;
end $$;

-- RPCs are authenticated-only.
do $$
begin
  if has_function_privilege('anon','public.update_feed_post_owner(uuid,text,text)','EXECUTE') then
    raise exception 'anon must not execute update_feed_post_owner';
  end if;
  if has_function_privilege('anon','public.delete_feed_post_owner(uuid)','EXECUTE') then
    raise exception 'anon must not execute delete_feed_post_owner';
  end if;
  if not has_function_privilege('authenticated','public.update_feed_post_owner(uuid,text,text)','EXECUTE') then
    raise exception 'authenticated must execute update_feed_post_owner';
  end if;
  if not has_function_privilege('authenticated','public.delete_feed_post_owner(uuid)','EXECUTE') then
    raise exception 'authenticated must execute delete_feed_post_owner';
  end if;
end $$;

-- Owner may edit body/category and non-editable fields are preserved.
do $$
declare
  ids feed_edit_delete_test_ids%rowtype;
  edited public.feed_posts;
begin
  select * into ids from feed_edit_delete_test_ids;
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',ids.owner_id::text,true);
  select * into edited from public.update_feed_post_owner(ids.post_id,'Edited story','leadership');

  if edited.user_id <> ids.owner_id or edited.visibility <> 'public' or edited.post_type <> 'leadership' or edited.body <> 'Edited story' or edited.updated_at is null then
    raise exception 'Owner edit did not preserve canonical fields or update expected fields';
  end if;
end $$;

-- Another user cannot edit or delete the owner's post.
do $$
declare
  ids feed_edit_delete_test_ids%rowtype;
  denied boolean := false;
begin
  select * into ids from feed_edit_delete_test_ids;
  perform set_config('request.jwt.claim.sub',ids.other_id::text,true);
  begin
    perform public.update_feed_post_owner(ids.post_id,'Unauthorized','civic');
  exception when others then denied := true;
  end;
  if not denied then raise exception 'Cross-user edit was not denied'; end if;

  denied := false;
  begin
    perform public.delete_feed_post_owner(ids.post_id);
  exception when others then denied := true;
  end;
  if not denied then raise exception 'Cross-user delete was not denied'; end if;
end $$;

-- Storage DELETE is limited to the authenticated owner's Feed namespace.
do $$
declare
  photo_policy text;
  video_policy text;
begin
  select qual into photo_policy from pg_policies where schemaname='storage' and tablename='objects' and policyname='feed_photos_owner_delete' and cmd='DELETE';
  select qual into video_policy from pg_policies where schemaname='storage' and tablename='objects' and policyname='feed_videos_owner_delete' and cmd='DELETE';
  if photo_policy is null or position('photos' in photo_policy)=0 or position('feed' in photo_policy)=0 or position('auth.uid' in photo_policy)=0 then
    raise exception 'Feed photo owner-delete policy is missing required boundary';
  end if;
  if video_policy is null or position('feed-videos' in video_policy)=0 or position('feed' in video_policy)=0 or position('auth.uid' in video_policy)=0 then
    raise exception 'Feed video owner-delete policy is missing required boundary';
  end if;
end $$;

-- Owner delete cascades dependent social records and returns media metadata.
do $$
declare
  ids feed_edit_delete_test_ids%rowtype;
  result jsonb;
begin
  select * into ids from feed_edit_delete_test_ids;
  perform set_config('request.jwt.claim.sub',ids.owner_id::text,true);
  select public.delete_feed_post_owner(ids.post_id) into result;

  if result->>'id' <> ids.post_id::text then raise exception 'Delete RPC did not return deleted post id'; end if;
  if exists(select 1 from public.feed_posts where id=ids.post_id) then raise exception 'Feed post still exists after owner delete'; end if;
  if exists(select 1 from public.feed_post_comments where id=ids.comment_id) then raise exception 'Comment did not cascade on post delete'; end if;
  if exists(select 1 from public.feed_post_reactions where id=ids.reaction_id) then raise exception 'Reaction did not cascade on post delete'; end if;
  if exists(select 1 from public.feed_post_shares where id=ids.share_id) then raise exception 'Share did not cascade on post delete'; end if;
end $$;

rollback;

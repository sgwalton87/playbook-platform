-- Performance-only hardening for the August 16 canonical authority layer.
-- This migration does not broaden access. It adds FK-supporting indexes and
-- rewrites owner identity checks to initplan-friendly `(select auth.uid())`.

create index if not exists active_support_scholar_contexts_relationship_idx
  on public.active_support_scholar_contexts(relationship_id);
create index if not exists active_support_scholar_contexts_scholar_idx
  on public.active_support_scholar_contexts(scholar_id);
create index if not exists learning_credentials_course_idx
  on public.learning_credentials(course_slug);
create index if not exists learning_module_progress_course_module_idx
  on public.learning_module_progress(course_slug, module_key);
create index if not exists community_event_attendance_user_idx
  on public.community_event_attendance(user_id);
create index if not exists community_event_attendance_verified_by_idx
  on public.community_event_attendance(verified_by);
create index if not exists mentor_circle_memberships_user_idx
  on public.mentor_circle_memberships(user_id);
create index if not exists mentor_circles_created_by_idx
  on public.mentor_circles(created_by);
create index if not exists mentor_circles_mentor_user_idx
  on public.mentor_circles(mentor_user_id);
create index if not exists verification_review_events_subject_idx
  on public.verification_review_events(subject_user_id);
create index if not exists verification_review_events_reviewer_idx
  on public.verification_review_events(reviewer_user_id);
create index if not exists brand_campaign_drafts_partner_idx
  on public.brand_campaign_drafts(partner_id);
create index if not exists brand_campaign_drafts_verification_idx
  on public.brand_campaign_drafts(verification_request_id);
create index if not exists brand_partners_verification_idx
  on public.brand_partners(verification_request_id);
create index if not exists store_redemptions_product_idx
  on public.store_redemptions(product_id);
create index if not exists profile_album_photos_album_idx
  on public.profile_album_photos(album_id);

drop policy if exists "Users view own achievement badges" on public.achievement_badges;
create policy "Users view own achievement badges"
on public.achievement_badges for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users view own learning progress" on public.learning_module_progress;
create policy "Users view own learning progress"
on public.learning_module_progress for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users view own learning credentials" on public.learning_credentials;
create policy "Users view own learning credentials"
on public.learning_credentials for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Authenticated can view published community events" on public.community_events;
create policy "Authenticated can view published community events"
on public.community_events for select to authenticated
using (
  status in ('published','completed')
  or created_by = (select auth.uid())
  or (select private.current_user_is_platform_operator())
);

drop policy if exists "Users view own event RSVPs" on public.community_event_rsvps;
create policy "Users view own event RSVPs"
on public.community_event_rsvps for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.current_user_is_platform_operator())
);

drop policy if exists "Users view own verified event attendance" on public.community_event_attendance;
create policy "Users view own verified event attendance"
on public.community_event_attendance for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.current_user_is_platform_operator())
);

drop policy if exists "Authenticated can view active mentor circles" on public.mentor_circles;
create policy "Authenticated can view active mentor circles"
on public.mentor_circles for select to authenticated
using (
  status = 'active'
  or mentor_user_id = (select auth.uid())
  or (select private.current_user_is_platform_operator())
);

drop policy if exists "Users view circle memberships" on public.mentor_circle_memberships;
create policy "Users view circle memberships"
on public.mentor_circle_memberships for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.mentor_circles c
    where c.id = mentor_circle_memberships.circle_id
      and c.mentor_user_id = (select auth.uid())
  )
  or (select private.current_user_is_platform_operator())
);

drop policy if exists "Owners view PBOS notifications" on public.pbos_notifications;
create policy "Owners view PBOS notifications"
on public.pbos_notifications for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Owners view notification outbox" on public.pbos_notification_outbox;
create policy "Owners view notification outbox"
on public.pbos_notification_outbox for select to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Owners view notification preferences" on public.pbos_notification_preferences;
create policy "Owners view notification preferences"
on public.pbos_notification_preferences for select to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Supporters view own active Scholar context" on public.active_support_scholar_contexts;
create policy "Supporters view own active Scholar context"
on public.active_support_scholar_contexts for select to authenticated
using (supporter_id = (select auth.uid()));

drop policy if exists "Users view own profile" on public.profiles;
create policy "Users view own profile"
on public.profiles for select to public
using (id = (select auth.uid()));

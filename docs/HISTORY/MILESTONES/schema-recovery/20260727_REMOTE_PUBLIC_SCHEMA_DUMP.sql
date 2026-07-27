


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."achievement_category" AS ENUM (
    'academic',
    'athletic',
    'career',
    'service',
    'leadership',
    'financial_literacy',
    'entrepreneurship',
    'creative',
    'civic',
    'personal_growth',
    'other'
);


ALTER TYPE "public"."achievement_category" OWNER TO "postgres";


CREATE TYPE "public"."activity_type" AS ENUM (
    'post',
    'course_completed',
    'badge_earned',
    'joined',
    'connection_made',
    'comment',
    'milestone'
);


ALTER TYPE "public"."activity_type" OWNER TO "postgres";


CREATE TYPE "public"."connection_status" AS ENUM (
    'pending',
    'accepted',
    'declined',
    'blocked'
);


ALTER TYPE "public"."connection_status" OWNER TO "postgres";


CREATE TYPE "public"."course_status" AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE "public"."course_status" OWNER TO "postgres";


CREATE TYPE "public"."enrollment_status" AS ENUM (
    'enrolled',
    'in_progress',
    'completed',
    'dropped'
);


ALTER TYPE "public"."enrollment_status" OWNER TO "postgres";


CREATE TYPE "public"."evidence_type" AS ENUM (
    'document',
    'photo',
    'video',
    'link',
    'certificate',
    'transcript',
    'recommendation',
    'media',
    'other'
);


ALTER TYPE "public"."evidence_type" OWNER TO "postgres";


CREATE TYPE "public"."member_role" AS ENUM (
    'scholar_athlete',
    'mentor',
    'coach',
    'recruiter',
    'teacher',
    'admin',
    'parent',
    'member',
    'scholar',
    'scholar-athlete',
    'transition-youth',
    'college-admin',
    'other'
);


ALTER TYPE "public"."member_role" OWNER TO "postgres";


CREATE TYPE "public"."mentorship_status" AS ENUM (
    'pending',
    'active',
    'completed',
    'declined'
);


ALTER TYPE "public"."mentorship_status" OWNER TO "postgres";


CREATE TYPE "public"."message_status" AS ENUM (
    'sent',
    'delivered',
    'read'
);


ALTER TYPE "public"."message_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'message',
    'connection_request',
    'mentorship_request',
    'course_update',
    'badge_earned',
    'comment',
    'like',
    'system'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."playbook_record_type" AS ENUM (
    'scholar',
    'scholar_athlete',
    'parent',
    'mentor',
    'coach',
    'educator',
    'organization',
    'alumni',
    'admin'
);


ALTER TYPE "public"."playbook_record_type" OWNER TO "postgres";


CREATE TYPE "public"."record_status" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE "public"."record_status" OWNER TO "postgres";


CREATE TYPE "public"."trust_level" AS ENUM (
    'activity',
    'achievement',
    'evidence',
    'verification',
    'outcome',
    'impact'
);


ALTER TYPE "public"."trust_level" OWNER TO "postgres";


CREATE TYPE "public"."vault_item_type" AS ENUM (
    'document',
    'photo',
    'video',
    'transcript',
    'certificate',
    'recommendation',
    'media',
    'other'
);


ALTER TYPE "public"."vault_item_type" OWNER TO "postgres";


CREATE TYPE "public"."verification_status" AS ENUM (
    'unverified',
    'pending',
    'verified',
    'rejected'
);


ALTER TYPE "public"."verification_status" OWNER TO "postgres";


CREATE TYPE "public"."visibility_level" AS ENUM (
    'private',
    'school',
    'network',
    'public'
);


ALTER TYPE "public"."visibility_level" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."award_coins"("p_profile_id" "uuid", "p_amount" integer, "p_reason" "text", "p_reference_id" "uuid" DEFAULT NULL::"uuid", "p_reference_type" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles SET coin_balance = coin_balance + p_amount WHERE id = p_profile_id;
  INSERT INTO coin_transactions (profile_id, amount, reason, reference_id, reference_type)
  VALUES (p_profile_id, p_amount, p_reason, p_reference_id, p_reference_type);
END;
$$;


ALTER FUNCTION "public"."award_coins"("p_profile_id" "uuid", "p_amount" integer, "p_reason" "text", "p_reference_id" "uuid", "p_reference_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_message"("sender_id" "uuid", "recipient_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  sender_role member_role;
  recipient_role member_role;
BEGIN
  SELECT role INTO sender_role FROM profiles WHERE id = sender_id;
  SELECT role INTO recipient_role FROM profiles WHERE id = recipient_id;

  -- Block coach → scholar_athlete messaging
  IF sender_role = 'coach' AND recipient_role = 'scholar_athlete' THEN
    RETURN FALSE;
  END IF;

  -- Block scholar_athlete → coach messaging
  IF sender_role = 'scholar_athlete' AND recipient_role = 'coach' THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."can_message"("sender_id" "uuid", "recipient_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."support_network_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scholar_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "relationship" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "is_starting_five" boolean DEFAULT true NOT NULL,
    "invited_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "supporter_profile_id" "uuid"
);


ALTER TABLE "public"."support_network_members" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_starting_five_invitation"("p_token" "text") RETURNS "public"."support_network_members"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  authenticated_email text;
  invitation_record public.starting_five_invitations;
  claimed_member public.support_network_members;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to claim this invitation.';
  end if;

  select email
  into authenticated_email
  from auth.users
  where id = auth.uid();

  if authenticated_email is null then
    raise exception 'Your Playbook account does not have an email address.';
  end if;

  select *
  into invitation_record
  from public.starting_five_invitations
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and claimed_at is null
    and revoked_at is null
    and expires_at > now()
  for update;

  if invitation_record.id is null then
    raise exception 'This invitation is invalid, expired, revoked, or already claimed.';
  end if;

  if lower(invitation_record.invited_email) <> lower(authenticated_email) then
    raise exception 'This invitation belongs to a different email address.';
  end if;

  update public.support_network_members
  set
    supporter_profile_id = auth.uid(),
    status = 'connected',
    accepted_at = coalesce(accepted_at, now()),
    updated_at = now()
  where id = invitation_record.member_id
    and supporter_profile_id is null
  returning *
  into claimed_member;

  if claimed_member.id is null then
    raise exception 'This Starting Five relationship has already been claimed.';
  end if;

  update public.starting_five_invitations
  set
    claimed_at = now(),
    updated_at = now()
  where id = invitation_record.id;

  return claimed_member;
end;
$$;


ALTER FUNCTION "public"."claim_starting_five_invitation"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (
    id,
    username,
    full_name,
    coin_balance,
    badges,
    created_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    0,
    '{}',
    now()
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_support_network_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."update_support_network_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "record_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "category" "public"."achievement_category" DEFAULT 'other'::"public"."achievement_category" NOT NULL,
    "description" "text",
    "organization" "text",
    "role" "text",
    "start_date" "date",
    "end_date" "date",
    "visibility" "public"."visibility_level" DEFAULT 'private'::"public"."visibility_level",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_feed" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "activity_type" "public"."activity_type" NOT NULL,
    "reference_id" "uuid",
    "reference_type" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_feed" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ag_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "subject" "text" NOT NULL,
    "subject_name" "text" NOT NULL,
    "years_required" numeric DEFAULT 1 NOT NULL,
    "years_completed" numeric DEFAULT 0 NOT NULL,
    "in_progress" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "courses_taken" "text"[] DEFAULT '{}'::"text"[],
    "current_course" "text"
);


ALTER TABLE "public"."ag_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."album_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "album_id" "uuid",
    "user_id" "uuid",
    "media_url" "text" NOT NULL,
    "media_type" "text",
    "caption" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."album_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "visibility" "text" DEFAULT 'public'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."albums" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."badges" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "trigger_type" "text" NOT NULL,
    "trigger_value" integer DEFAULT 1,
    "coin_reward" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."careers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "salary_range" "text",
    "median_pay" "text",
    "source_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "education_required" "text",
    "job_outlook" "text",
    "projected_openings" "text",
    "training_required" "text",
    "career_cluster" "text",
    "description" "text",
    "bls_code" "text"
);


ALTER TABLE "public"."careers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."certificates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "course_slug" "text" NOT NULL,
    "certificate_name" "text",
    "issued_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."certificates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coin_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "reason" "text" NOT NULL,
    "reference_id" "uuid",
    "reference_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."coin_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."college_list" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "college_name" "text" NOT NULL,
    "college_type" "text",
    "status" "text" DEFAULT 'planning'::"text",
    "deadline" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "college_list_college_type_check" CHECK (("college_type" = ANY (ARRAY['reach'::"text", 'match'::"text", 'safety'::"text", 'dream'::"text"])))
);


ALTER TABLE "public"."college_list" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."colleges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "text",
    "name" "text" NOT NULL,
    "city" "text",
    "state" "text",
    "school_url" "text",
    "ownership" "text",
    "highest_degree" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."colleges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."connection_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "responded_at" timestamp with time zone,
    CONSTRAINT "connection_requests_check" CHECK (("requester_id" <> "recipient_id")),
    CONSTRAINT "connection_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."connection_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."connections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "addressee_id" "uuid" NOT NULL,
    "status" "public"."connection_status" DEFAULT 'pending'::"public"."connection_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "connections_check" CHECK (("requester_id" <> "addressee_id"))
);


ALTER TABLE "public"."connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "conversation_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "last_read_at" timestamp with time zone
);


ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_slug" "text" NOT NULL,
    "module_order" integer NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "course_slug" "text" NOT NULL,
    "completed_modules" integer[] DEFAULT '{}'::integer[],
    "completed" boolean DEFAULT false,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."course_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "instructor_id" "uuid",
    "cover_url" "text",
    "category" "text",
    "pillar" "text",
    "status" "public"."course_status" DEFAULT 'draft'::"public"."course_status",
    "price" numeric(10,2) DEFAULT 0,
    "coin_reward" integer DEFAULT 0,
    "duration_mins" integer,
    "lesson_count" integer DEFAULT 0,
    "enrollment_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text",
    "xp_reward" integer DEFAULT 100,
    "is_available" boolean DEFAULT true,
    "image_url" "text",
    "flagship_order" integer
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "text" NOT NULL,
    "value" "text" NOT NULL,
    "added_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deadlines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "due_date" "date" NOT NULL,
    "category" "text",
    "completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."deadlines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."earned_badges" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."earned_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enrollments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "status" "public"."enrollment_status" DEFAULT 'enrolled'::"public"."enrollment_status",
    "progress" integer DEFAULT 0,
    "enrolled_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."enrollments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evidence" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "evidence_type" "public"."evidence_type" DEFAULT 'other'::"public"."evidence_type" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "url" "text",
    "file_path" "text",
    "storage_bucket" "text" DEFAULT 'scholar-vault'::"text",
    "storage_object_path" "text",
    "source" "text",
    "verified" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evidence_packs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."evidence_packs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feed_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "post_type" "text" NOT NULL,
    "title" "text",
    "body" "text",
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "visibility" "text" DEFAULT 'public'::"text",
    "media_url" "text",
    "media_type" "text",
    "album_id" "uuid"
);


ALTER TABLE "public"."feed_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "group_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "creator_id" "uuid" NOT NULL,
    "cover_url" "text",
    "is_private" boolean DEFAULT false,
    "member_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lesson_completions" (
    "profile_id" "uuid" NOT NULL,
    "lesson_id" "uuid" NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lesson_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lessons" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "video_url" "text",
    "order_index" integer NOT NULL,
    "duration_mins" integer,
    "coin_reward" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lessons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentorship_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "scholar_id" "uuid" NOT NULL,
    "mentor_id" "uuid" NOT NULL,
    "message" "text",
    "status" "public"."mentorship_status" DEFAULT 'pending'::"public"."mentorship_status",
    "goals" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mentorship_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentorship_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "mentorship_id" "uuid" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "duration_mins" integer DEFAULT 60,
    "notes" "text",
    "zoom_link" "text",
    "completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mentorship_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "status" "public"."message_status" DEFAULT 'sent'::"public"."message_status",
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."milestone_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action_key" "text",
    "verified" boolean DEFAULT false,
    "awarded_points" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."milestone_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "reference_id" "uuid",
    "reference_type" "text",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "value" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."onboarding_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."opportunity_matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "record_id" "uuid" NOT NULL,
    "opportunity_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "readiness_score" integer DEFAULT 0,
    "reasons" "jsonb" DEFAULT '[]'::"jsonb",
    "next_steps" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'recommended'::"text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."opportunity_matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "price" numeric(10,2) NOT NULL
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "total" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "stripe_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."outcomes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "outcome_type" "text" DEFAULT 'other'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "value" "text",
    "outcome_date" "date",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."outcomes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pending_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "role" "text" NOT NULL,
    "full_name" "text",
    "email" "text",
    "school" "text",
    "edu_email" "text",
    "reason" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '14 days'::interval),
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "notes" "text"
);


ALTER TABLE "public"."pending_verifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."playbook_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "record_type" "public"."playbook_record_type" DEFAULT 'scholar'::"public"."playbook_record_type",
    "status" "public"."record_status" DEFAULT 'active'::"public"."record_status",
    "summary" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."playbook_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_likes" (
    "post_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "image_url" "text",
    "like_count" integer DEFAULT 0,
    "comment_count" integer DEFAULT 0,
    "is_pinned" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "coin_price" integer,
    "image_url" "text",
    "category" "text",
    "stock" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "full_name" "text",
    "role" "text" DEFAULT 'scholar_athlete'::"public"."member_role" NOT NULL,
    "avatar_url" "text",
    "cover_url" "text",
    "bio" "text",
    "location" "text",
    "school" "text",
    "sport" "text",
    "grad_year" integer,
    "gpa" numeric(3,2),
    "instagram" "text",
    "twitter" "text",
    "linkedin" "text",
    "onboarding_complete" boolean DEFAULT false,
    "coin_balance" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true,
    "last_seen" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "gender" "text",
    "badges" "text"[] DEFAULT '{}'::"text"[],
    "first_name" "text",
    "last_name" "text",
    "date_of_birth" "date",
    "xp" integer DEFAULT 0,
    "level" integer DEFAULT 1,
    "streak" integer DEFAULT 0,
    "last_login" "date",
    "position" "text",
    "height" "text",
    "weight" "text",
    "dominant_hand" "text",
    "jersey_number" "text",
    "travel_team" "text",
    "club_team" "text",
    "coach_name" "text",
    "coach_email" "text",
    "sat_score" "text",
    "act_score" "text",
    "intended_major" "text",
    "dream_school" "text",
    "tiktok" "text",
    "hudl" "text",
    "youtube" "text",
    "highlight_reel_url" "text",
    "verification_status" "text" DEFAULT 'approved'::"text",
    "verification_requested_at" timestamp with time zone,
    "verification_expires_at" timestamp with time zone,
    "verified_at" timestamp with time zone,
    "verified_by" "text",
    "edu_email" "text",
    "is_admin" boolean DEFAULT false,
    "onboarded" boolean DEFAULT false,
    "pillars" "text"[] DEFAULT '{}'::"text"[],
    "has_iep" boolean DEFAULT false,
    "unhoused" boolean DEFAULT false,
    "foster_youth" boolean DEFAULT false,
    "migrant_student" boolean DEFAULT false,
    "free_reduced_lunch" boolean DEFAULT false,
    "first_generation" boolean DEFAULT false,
    "household_income" "text",
    "english_language_learner" boolean DEFAULT false,
    "school_district" "text",
    "zip_code" "text",
    "team_level" "text",
    "registration_type" "text",
    "academic_gpa" "text",
    "weighted_gpa" "text",
    "unweighted_gpa" "text",
    "current_math" "text",
    "current_english" "text",
    "current_science" "text",
    "college_goal" "text",
    "ideal_profession" "text",
    "desired_salary_range" "text",
    "recruiting_status" "text",
    "desired_college_level" "text",
    "athlete_email" "text",
    "camps_attended" "text",
    "nil_instagram" "text",
    "nil_tiktok" "text",
    "nil_twitter" "text",
    "nil_follower_range" "text",
    "nil_brand_interests" "text"[],
    "nil_worked_with_brands" boolean DEFAULT false,
    "nil_deal_types" "text"[],
    "dream_school_name" "text",
    "dream_school_id" "text",
    "favorite_quote" "text",
    "college_list_2" "text",
    "college_list_3" "text",
    "college_list_4" "text",
    "college_list_5" "text",
    "college_list_6" "text",
    "college_list_7" "text",
    "college_list_8" "text",
    "college_list_9" "text",
    "college_list_10" "text",
    "grade" "text",
    "city" "text",
    "state" "text",
    "profile_visibility" "text" DEFAULT 'public'::"text",
    "onboarding_data" "jsonb" DEFAULT '{}'::"jsonb",
    "onboarding_completed" boolean DEFAULT false,
    "onboarding_completed_at" timestamp with time zone,
    "public_profile_complete" boolean DEFAULT false,
    "community_safety_agreed" boolean DEFAULT false,
    "community_safety_agreed_at" timestamp with time zone,
    "community_safety_policy_version" "text",
    "profile_mode" "text",
    "email" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_attempts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "quiz_id" "uuid" NOT NULL,
    "score" integer NOT NULL,
    "passed" boolean NOT NULL,
    "answers" "jsonb",
    "attempted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quiz_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "quiz_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "options" "jsonb" NOT NULL,
    "order_index" integer NOT NULL
);


ALTER TABLE "public"."quiz_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quizzes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "lesson_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "pass_score" integer DEFAULT 70,
    "coin_reward" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quizzes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reflections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "prompt" "text",
    "response" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."reflections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scholar_vault_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "record_id" "uuid" NOT NULL,
    "item_type" "public"."vault_item_type" DEFAULT 'document'::"public"."vault_item_type" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "file_path" "text",
    "storage_bucket" "text" DEFAULT 'scholar-vault'::"text",
    "storage_object_path" "text",
    "url" "text",
    "visibility" "public"."visibility_level" DEFAULT 'private'::"public"."visibility_level",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."scholar_vault_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."starting_five_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" "uuid" NOT NULL,
    "invited_email" "text" NOT NULL,
    "token_hash" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "sent_at" timestamp with time zone,
    "claimed_at" timestamp with time zone,
    "revoked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."starting_five_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid",
    "activity_type" "text" NOT NULL,
    "activity_name" "text" NOT NULL,
    "role_title" "text",
    "organization" "text",
    "total_hours" numeric,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."student_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timeline_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "record_id" "uuid" NOT NULL,
    "achievement_id" "uuid",
    "event_type" "text" DEFAULT 'achievement'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "event_date" timestamp with time zone,
    "source" "text",
    "verified" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."timeline_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trust_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "record_id" "uuid" NOT NULL,
    "trust_score" integer DEFAULT 0,
    "trust_level" "public"."trust_level" DEFAULT 'activity'::"public"."trust_level",
    "signals" "jsonb" DEFAULT '[]'::"jsonb",
    "missing" "jsonb" DEFAULT '[]'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."trust_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "badge_id" "uuid",
    "awarded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "connected_user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_connections_check" CHECK (("user_id" <> "connected_user_id"))
);


ALTER TABLE "public"."user_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "status" "public"."verification_status" DEFAULT 'pending'::"public"."verification_status",
    "verified_by" "uuid",
    "verifier_role" "text",
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "updated_by" "uuid",
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."verifications" OWNER TO "postgres";


ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ag_progress"
    ADD CONSTRAINT "ag_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ag_progress"
    ADD CONSTRAINT "ag_progress_user_id_subject_key" UNIQUE ("user_id", "subject");



ALTER TABLE ONLY "public"."album_media"
    ADD CONSTRAINT "album_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."careers"
    ADD CONSTRAINT "careers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."careers"
    ADD CONSTRAINT "careers_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coin_transactions"
    ADD CONSTRAINT "coin_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."college_list"
    ADD CONSTRAINT "college_list_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "colleges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "colleges_unit_id_key" UNIQUE ("unit_id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."connection_requests"
    ADD CONSTRAINT "connection_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."connection_requests"
    ADD CONSTRAINT "connection_requests_requester_id_recipient_id_key" UNIQUE ("requester_id", "recipient_id");



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_requester_id_addressee_id_key" UNIQUE ("requester_id", "addressee_id");



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id", "profile_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_course_slug_module_order_key" UNIQUE ("course_slug", "module_order");



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "course_progress_user_id_course_slug_key" UNIQUE ("user_id", "course_slug");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_options"
    ADD CONSTRAINT "custom_options_category_value_key" UNIQUE ("category", "value");



ALTER TABLE ONLY "public"."custom_options"
    ADD CONSTRAINT "custom_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deadlines"
    ADD CONSTRAINT "deadlines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."earned_badges"
    ADD CONSTRAINT "earned_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."earned_badges"
    ADD CONSTRAINT "earned_badges_profile_id_badge_id_key" UNIQUE ("profile_id", "badge_id");



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_profile_id_course_id_key" UNIQUE ("profile_id", "course_id");



ALTER TABLE ONLY "public"."evidence_packs"
    ADD CONSTRAINT "evidence_packs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feed_posts"
    ADD CONSTRAINT "feed_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id", "profile_id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lesson_completions"
    ADD CONSTRAINT "lesson_completions_pkey" PRIMARY KEY ("profile_id", "lesson_id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mentorship_requests"
    ADD CONSTRAINT "mentorship_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mentorship_requests"
    ADD CONSTRAINT "mentorship_requests_scholar_id_mentor_id_key" UNIQUE ("scholar_id", "mentor_id");



ALTER TABLE ONLY "public"."mentorship_sessions"
    ADD CONSTRAINT "mentorship_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."milestone_actions"
    ADD CONSTRAINT "milestone_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_options"
    ADD CONSTRAINT "onboarding_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_options"
    ADD CONSTRAINT "onboarding_options_type_value_key" UNIQUE ("type", "value");



ALTER TABLE ONLY "public"."opportunity_matches"
    ADD CONSTRAINT "opportunity_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."outcomes"
    ADD CONSTRAINT "outcomes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_verifications"
    ADD CONSTRAINT "pending_verifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."playbook_records"
    ADD CONSTRAINT "playbook_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id", "profile_id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reflections"
    ADD CONSTRAINT "reflections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scholar_vault_items"
    ADD CONSTRAINT "scholar_vault_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."starting_five_invitations"
    ADD CONSTRAINT "starting_five_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."starting_five_invitations"
    ADD CONSTRAINT "starting_five_invitations_token_hash_key" UNIQUE ("token_hash");



ALTER TABLE ONLY "public"."student_activities"
    ADD CONSTRAINT "student_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_network_members"
    ADD CONSTRAINT "support_network_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_network_members"
    ADD CONSTRAINT "support_network_members_unique_role" UNIQUE ("scholar_id", "role");



ALTER TABLE ONLY "public"."timeline_events"
    ADD CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trust_reports"
    ADD CONSTRAINT "trust_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_user_id_connected_user_id_key" UNIQUE ("user_id", "connected_user_id");



ALTER TABLE ONLY "public"."verifications"
    ADD CONSTRAINT "verifications_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "badges_name_unique" ON "public"."badges" USING "btree" ("name");



CREATE UNIQUE INDEX "certificates_user_course_unique" ON "public"."certificates" USING "btree" ("user_id", "course_slug");



CREATE UNIQUE INDEX "course_progress_user_course_unique" ON "public"."course_progress" USING "btree" ("user_id", "course_slug");



CREATE UNIQUE INDEX "courses_slug_unique" ON "public"."courses" USING "btree" ("slug");



CREATE INDEX "idx_achievements_record_id" ON "public"."achievements" USING "btree" ("record_id");



CREATE INDEX "idx_activity_feed_profile" ON "public"."activity_feed" USING "btree" ("profile_id", "created_at" DESC);



CREATE INDEX "idx_coin_transactions_profile" ON "public"."coin_transactions" USING "btree" ("profile_id");



CREATE INDEX "idx_connections_addressee" ON "public"."connections" USING "btree" ("addressee_id");



CREATE INDEX "idx_connections_requester" ON "public"."connections" USING "btree" ("requester_id");



CREATE INDEX "idx_enrollments_profile" ON "public"."enrollments" USING "btree" ("profile_id");



CREATE INDEX "idx_evidence_achievement_id" ON "public"."evidence" USING "btree" ("achievement_id");



CREATE INDEX "idx_evidence_packs_achievement_id" ON "public"."evidence_packs" USING "btree" ("achievement_id");



CREATE INDEX "idx_messages_conversation" ON "public"."messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_notifications_profile" ON "public"."notifications" USING "btree" ("profile_id", "is_read", "created_at" DESC);



CREATE INDEX "idx_opportunity_matches_record_id" ON "public"."opportunity_matches" USING "btree" ("record_id");



CREATE INDEX "idx_outcomes_achievement_id" ON "public"."outcomes" USING "btree" ("achievement_id");



CREATE INDEX "idx_playbook_records_profile_id" ON "public"."playbook_records" USING "btree" ("profile_id");



CREATE INDEX "idx_posts_author" ON "public"."posts" USING "btree" ("author_id", "created_at" DESC);



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "idx_reflections_achievement_id" ON "public"."reflections" USING "btree" ("achievement_id");



CREATE INDEX "idx_scholar_vault_items_record_id" ON "public"."scholar_vault_items" USING "btree" ("record_id");



CREATE INDEX "idx_support_network_members_role" ON "public"."support_network_members" USING "btree" ("role");



CREATE INDEX "idx_support_network_members_scholar" ON "public"."support_network_members" USING "btree" ("scholar_id");



CREATE INDEX "idx_timeline_events_achievement_id" ON "public"."timeline_events" USING "btree" ("achievement_id");



CREATE INDEX "idx_timeline_events_record_id" ON "public"."timeline_events" USING "btree" ("record_id");



CREATE INDEX "idx_trust_reports_record_id" ON "public"."trust_reports" USING "btree" ("record_id");



CREATE INDEX "idx_verifications_achievement_id" ON "public"."verifications" USING "btree" ("achievement_id");



CREATE INDEX "starting_five_invitations_active_idx" ON "public"."starting_five_invitations" USING "btree" ("expires_at") WHERE (("claimed_at" IS NULL) AND ("revoked_at" IS NULL));



CREATE INDEX "starting_five_invitations_email_idx" ON "public"."starting_five_invitations" USING "btree" ("lower"("invited_email"));



CREATE INDEX "starting_five_invitations_member_id_idx" ON "public"."starting_five_invitations" USING "btree" ("member_id");



CREATE INDEX "support_network_members_pending_email_idx" ON "public"."support_network_members" USING "btree" ("lower"("email")) WHERE (("supporter_profile_id" IS NULL) AND ("email" IS NOT NULL));



CREATE INDEX "support_network_members_supporter_profile_id_idx" ON "public"."support_network_members" USING "btree" ("supporter_profile_id");



CREATE OR REPLACE TRIGGER "connections_updated_at" BEFORE UPDATE ON "public"."connections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "courses_updated_at" BEFORE UPDATE ON "public"."courses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "mentorship_updated_at" BEFORE UPDATE ON "public"."mentorship_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "set_achievements_updated_at" BEFORE UPDATE ON "public"."achievements" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_evidence_packs_updated_at" BEFORE UPDATE ON "public"."evidence_packs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_evidence_updated_at" BEFORE UPDATE ON "public"."evidence" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_opportunity_matches_updated_at" BEFORE UPDATE ON "public"."opportunity_matches" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_outcomes_updated_at" BEFORE UPDATE ON "public"."outcomes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_playbook_records_updated_at" BEFORE UPDATE ON "public"."playbook_records" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_reflections_updated_at" BEFORE UPDATE ON "public"."reflections" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_scholar_vault_items_updated_at" BEFORE UPDATE ON "public"."scholar_vault_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timeline_events_updated_at" BEFORE UPDATE ON "public"."timeline_events" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_verifications_updated_at" BEFORE UPDATE ON "public"."verifications" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_support_network_updated_at" BEFORE UPDATE ON "public"."support_network_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_support_network_updated_at"();



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."playbook_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ag_progress"
    ADD CONSTRAINT "ag_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."album_media"
    ADD CONSTRAINT "album_media_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."album_media"
    ADD CONSTRAINT "album_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coin_transactions"
    ADD CONSTRAINT "coin_transactions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."college_list"
    ADD CONSTRAINT "college_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."connection_requests"
    ADD CONSTRAINT "connection_requests_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."connection_requests"
    ADD CONSTRAINT "connection_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_course_slug_fkey" FOREIGN KEY ("course_slug") REFERENCES "public"."courses"("slug") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "course_progress_course_slug_fkey" FOREIGN KEY ("course_slug") REFERENCES "public"."courses"("slug") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "course_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."custom_options"
    ADD CONSTRAINT "custom_options_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."deadlines"
    ADD CONSTRAINT "deadlines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."earned_badges"
    ADD CONSTRAINT "earned_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."earned_badges"
    ADD CONSTRAINT "earned_badges_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."evidence_packs"
    ADD CONSTRAINT "evidence_packs_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evidence_packs"
    ADD CONSTRAINT "evidence_packs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."evidence_packs"
    ADD CONSTRAINT "evidence_packs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."feed_posts"
    ADD CONSTRAINT "feed_posts_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."feed_posts"
    ADD CONSTRAINT "feed_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."lesson_completions"
    ADD CONSTRAINT "lesson_completions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_completions"
    ADD CONSTRAINT "lesson_completions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorship_requests"
    ADD CONSTRAINT "mentorship_requests_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorship_requests"
    ADD CONSTRAINT "mentorship_requests_scholar_id_fkey" FOREIGN KEY ("scholar_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentorship_sessions"
    ADD CONSTRAINT "mentorship_sessions_mentorship_id_fkey" FOREIGN KEY ("mentorship_id") REFERENCES "public"."mentorship_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."milestone_actions"
    ADD CONSTRAINT "milestone_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_options"
    ADD CONSTRAINT "onboarding_options_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."opportunity_matches"
    ADD CONSTRAINT "opportunity_matches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."opportunity_matches"
    ADD CONSTRAINT "opportunity_matches_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."playbook_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."opportunity_matches"
    ADD CONSTRAINT "opportunity_matches_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."outcomes"
    ADD CONSTRAINT "outcomes_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."outcomes"
    ADD CONSTRAINT "outcomes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."outcomes"
    ADD CONSTRAINT "outcomes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pending_verifications"
    ADD CONSTRAINT "pending_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playbook_records"
    ADD CONSTRAINT "playbook_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."playbook_records"
    ADD CONSTRAINT "playbook_records_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playbook_records"
    ADD CONSTRAINT "playbook_records_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reflections"
    ADD CONSTRAINT "reflections_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reflections"
    ADD CONSTRAINT "reflections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reflections"
    ADD CONSTRAINT "reflections_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."scholar_vault_items"
    ADD CONSTRAINT "scholar_vault_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."scholar_vault_items"
    ADD CONSTRAINT "scholar_vault_items_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."playbook_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scholar_vault_items"
    ADD CONSTRAINT "scholar_vault_items_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."starting_five_invitations"
    ADD CONSTRAINT "starting_five_invitations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."support_network_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_activities"
    ADD CONSTRAINT "student_activities_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_network_members"
    ADD CONSTRAINT "support_network_members_scholar_id_fkey" FOREIGN KEY ("scholar_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_network_members"
    ADD CONSTRAINT "support_network_members_supporter_profile_id_fkey" FOREIGN KEY ("supporter_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."timeline_events"
    ADD CONSTRAINT "timeline_events_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."timeline_events"
    ADD CONSTRAINT "timeline_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."timeline_events"
    ADD CONSTRAINT "timeline_events_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."playbook_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timeline_events"
    ADD CONSTRAINT "timeline_events_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trust_reports"
    ADD CONSTRAINT "trust_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trust_reports"
    ADD CONSTRAINT "trust_reports_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."playbook_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_connected_user_id_fkey" FOREIGN KEY ("connected_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."verifications"
    ADD CONSTRAINT "verifications_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."verifications"
    ADD CONSTRAINT "verifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."verifications"
    ADD CONSTRAINT "verifications_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."verifications"
    ADD CONSTRAINT "verifications_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can read all" ON "public"."pending_verifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can update" ON "public"."pending_verifications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins manage all support members" ON "public"."support_network_members" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text")))));



CREATE POLICY "Anyone can read" ON "public"."custom_options" FOR SELECT USING (true);



CREATE POLICY "Authenticated can insert" ON "public"."custom_options" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can create posts" ON "public"."posts" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Authenticated users can view badges" ON "public"."badges" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Careers are viewable by everyone" ON "public"."careers" FOR SELECT USING (true);



CREATE POLICY "Options viewable" ON "public"."onboarding_options" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Owner can delete support members" ON "public"."support_network_members" FOR DELETE USING (("auth"."uid"() = "scholar_id"));



CREATE POLICY "Owner can insert support members" ON "public"."support_network_members" FOR INSERT WITH CHECK (("auth"."uid"() = "scholar_id"));



CREATE POLICY "Owner can update support members" ON "public"."support_network_members" FOR UPDATE USING (("auth"."uid"() = "scholar_id")) WITH CHECK (("auth"."uid"() = "scholar_id"));



CREATE POLICY "Posts are viewable by everyone" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Public can read feed posts" ON "public"."feed_posts" FOR SELECT USING (true);



CREATE POLICY "Public can view album media" ON "public"."album_media" FOR SELECT USING (true);



CREATE POLICY "Public can view albums" ON "public"."albums" FOR SELECT USING (("visibility" = 'public'::"text"));



CREATE POLICY "Public can view badges" ON "public"."badges" FOR SELECT USING (true);



CREATE POLICY "Public can view certificates" ON "public"."certificates" FOR SELECT USING (true);



CREATE POLICY "Public can view course modules" ON "public"."course_modules" FOR SELECT USING (true);



CREATE POLICY "Public can view courses" ON "public"."courses" FOR SELECT USING (true);



CREATE POLICY "Public can view feed posts" ON "public"."feed_posts" FOR SELECT USING (true);



CREATE POLICY "Public can view public feed posts" ON "public"."feed_posts" FOR SELECT USING (("visibility" = 'public'::"text"));



CREATE POLICY "Public can view user badges" ON "public"."user_badges" FOR SELECT USING (true);



CREATE POLICY "Recipients can respond to connection requests" ON "public"."connection_requests" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "recipient_id") OR ("auth"."uid"() = "requester_id"))) WITH CHECK ((("auth"."uid"() = "recipient_id") OR ("auth"."uid"() = "requester_id")));



CREATE POLICY "Support members are viewable by owner" ON "public"."support_network_members" FOR SELECT USING (("auth"."uid"() = "scholar_id"));



CREATE POLICY "Users add options" ON "public"."onboarding_options" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can create connection requests" ON "public"."connection_requests" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "requester_id"));



CREATE POLICY "Users can create connection requests" ON "public"."connections" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "requester_id"));



CREATE POLICY "Users can create own album media" ON "public"."album_media" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own albums" ON "public"."albums" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own connections" ON "public"."user_connections" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own feed posts" ON "public"."feed_posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own posts" ON "public"."posts" FOR DELETE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can insert own" ON "public"."pending_verifications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own course progress" ON "public"."course_progress" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own posts" ON "public"."feed_posts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own achievements" ON "public"."achievements" USING ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "achievements"."record_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "achievements"."record_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own certificates" ON "public"."certificates" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own course progress" ON "public"."course_progress" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own evidence" ON "public"."evidence" USING ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "evidence"."achievement_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "evidence"."achievement_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own evidence packs" ON "public"."evidence_packs" USING ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "evidence_packs"."achievement_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "evidence_packs"."achievement_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own opportunity matches" ON "public"."opportunity_matches" USING ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "opportunity_matches"."record_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "opportunity_matches"."record_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own outcomes" ON "public"."outcomes" USING ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "outcomes"."achievement_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "outcomes"."achievement_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own playbook records" ON "public"."playbook_records" USING (("profile_id" = "auth"."uid"())) WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own reflections" ON "public"."reflections" USING ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "reflections"."achievement_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "reflections"."achievement_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own timeline events" ON "public"."timeline_events" USING ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "timeline_events"."record_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "timeline_events"."record_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own trust reports" ON "public"."trust_reports" USING ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "trust_reports"."record_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "trust_reports"."record_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own vault items" ON "public"."scholar_vault_items" USING ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "scholar_vault_items"."record_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."playbook_records" "r"
  WHERE (("r"."id" = "scholar_vault_items"."record_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own verifications" ON "public"."verifications" USING ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "verifications"."achievement_id") AND ("r"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."achievements" "a"
     JOIN "public"."playbook_records" "r" ON (("r"."id" = "a"."record_id")))
  WHERE (("a"."id" = "verifications"."achievement_id") AND ("r"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can remove own connections" ON "public"."user_connections" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = "connected_user_id")));



CREATE POLICY "Users can send messages" ON "public"."messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND "public"."can_message"("auth"."uid"(), ( SELECT "conversation_participants"."profile_id"
   FROM "public"."conversation_participants"
  WHERE (("conversation_participants"."conversation_id" = "messages"."conversation_id") AND ("conversation_participants"."profile_id" <> "auth"."uid"()))
 LIMIT 1))));



CREATE POLICY "Users can update own course progress" ON "public"."course_progress" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Users can update own posts" ON "public"."posts" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can view own certificates" ON "public"."certificates" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own connection requests" ON "public"."connection_requests" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "recipient_id")));



CREATE POLICY "Users can view own connections" ON "public"."connections" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "addressee_id")));



CREATE POLICY "Users can view own connections" ON "public"."user_connections" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = "connected_user_id")));



CREATE POLICY "Users can view own course progress" ON "public"."course_progress" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Users can view own transactions" ON "public"."coin_transactions" FOR SELECT USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Users can view own user badges" ON "public"."user_badges" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own messages" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants"
  WHERE (("conversation_participants"."conversation_id" = "messages"."conversation_id") AND ("conversation_participants"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users manage own ag_progress" ON "public"."ag_progress" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own college_list" ON "public"."college_list" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own deadlines" ON "public"."deadlines" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_feed" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ag_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."album_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."albums" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."careers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certificates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coin_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."college_list" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."colleges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."connection_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deadlines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."earned_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enrollments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evidence_packs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feed_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lesson_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lessons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentorship_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentorship_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."milestone_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."opportunity_matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."outcomes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pending_verifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."playbook_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quizzes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reflections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scholar_vault_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."starting_five_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_network_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timeline_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trust_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verifications" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."award_coins"("p_profile_id" "uuid", "p_amount" integer, "p_reason" "text", "p_reference_id" "uuid", "p_reference_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."award_coins"("p_profile_id" "uuid", "p_amount" integer, "p_reason" "text", "p_reference_id" "uuid", "p_reference_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."award_coins"("p_profile_id" "uuid", "p_amount" integer, "p_reason" "text", "p_reference_id" "uuid", "p_reference_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_message"("sender_id" "uuid", "recipient_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_message"("sender_id" "uuid", "recipient_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_message"("sender_id" "uuid", "recipient_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."support_network_members" TO "anon";
GRANT ALL ON TABLE "public"."support_network_members" TO "authenticated";
GRANT ALL ON TABLE "public"."support_network_members" TO "service_role";



REVOKE ALL ON FUNCTION "public"."claim_starting_five_invitation"("p_token" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_starting_five_invitation"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."claim_starting_five_invitation"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_starting_five_invitation"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_support_network_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_support_network_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_support_network_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."achievements" TO "anon";
GRANT ALL ON TABLE "public"."achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."achievements" TO "service_role";



GRANT ALL ON TABLE "public"."activity_feed" TO "anon";
GRANT ALL ON TABLE "public"."activity_feed" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_feed" TO "service_role";



GRANT ALL ON TABLE "public"."ag_progress" TO "anon";
GRANT ALL ON TABLE "public"."ag_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."ag_progress" TO "service_role";



GRANT ALL ON TABLE "public"."album_media" TO "anon";
GRANT ALL ON TABLE "public"."album_media" TO "authenticated";
GRANT ALL ON TABLE "public"."album_media" TO "service_role";



GRANT ALL ON TABLE "public"."albums" TO "anon";
GRANT ALL ON TABLE "public"."albums" TO "authenticated";
GRANT ALL ON TABLE "public"."albums" TO "service_role";



GRANT ALL ON TABLE "public"."badges" TO "anon";
GRANT ALL ON TABLE "public"."badges" TO "authenticated";
GRANT ALL ON TABLE "public"."badges" TO "service_role";



GRANT ALL ON TABLE "public"."careers" TO "anon";
GRANT ALL ON TABLE "public"."careers" TO "authenticated";
GRANT ALL ON TABLE "public"."careers" TO "service_role";



GRANT ALL ON TABLE "public"."certificates" TO "anon";
GRANT ALL ON TABLE "public"."certificates" TO "authenticated";
GRANT ALL ON TABLE "public"."certificates" TO "service_role";



GRANT ALL ON TABLE "public"."coin_transactions" TO "anon";
GRANT ALL ON TABLE "public"."coin_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."coin_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."college_list" TO "anon";
GRANT ALL ON TABLE "public"."college_list" TO "authenticated";
GRANT ALL ON TABLE "public"."college_list" TO "service_role";



GRANT ALL ON TABLE "public"."colleges" TO "anon";
GRANT ALL ON TABLE "public"."colleges" TO "authenticated";
GRANT ALL ON TABLE "public"."colleges" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."connection_requests" TO "anon";
GRANT ALL ON TABLE "public"."connection_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."connection_requests" TO "service_role";



GRANT ALL ON TABLE "public"."connections" TO "anon";
GRANT ALL ON TABLE "public"."connections" TO "authenticated";
GRANT ALL ON TABLE "public"."connections" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_participants" TO "anon";
GRANT ALL ON TABLE "public"."conversation_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."course_modules" TO "anon";
GRANT ALL ON TABLE "public"."course_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."course_modules" TO "service_role";



GRANT ALL ON TABLE "public"."course_progress" TO "anon";
GRANT ALL ON TABLE "public"."course_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."course_progress" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."custom_options" TO "anon";
GRANT ALL ON TABLE "public"."custom_options" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_options" TO "service_role";



GRANT ALL ON TABLE "public"."deadlines" TO "anon";
GRANT ALL ON TABLE "public"."deadlines" TO "authenticated";
GRANT ALL ON TABLE "public"."deadlines" TO "service_role";



GRANT ALL ON TABLE "public"."earned_badges" TO "anon";
GRANT ALL ON TABLE "public"."earned_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."earned_badges" TO "service_role";



GRANT ALL ON TABLE "public"."enrollments" TO "anon";
GRANT ALL ON TABLE "public"."enrollments" TO "authenticated";
GRANT ALL ON TABLE "public"."enrollments" TO "service_role";



GRANT ALL ON TABLE "public"."evidence" TO "anon";
GRANT ALL ON TABLE "public"."evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."evidence" TO "service_role";



GRANT ALL ON TABLE "public"."evidence_packs" TO "anon";
GRANT ALL ON TABLE "public"."evidence_packs" TO "authenticated";
GRANT ALL ON TABLE "public"."evidence_packs" TO "service_role";



GRANT ALL ON TABLE "public"."feed_posts" TO "anon";
GRANT ALL ON TABLE "public"."feed_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."feed_posts" TO "service_role";



GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."lesson_completions" TO "anon";
GRANT ALL ON TABLE "public"."lesson_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."lesson_completions" TO "service_role";



GRANT ALL ON TABLE "public"."lessons" TO "anon";
GRANT ALL ON TABLE "public"."lessons" TO "authenticated";
GRANT ALL ON TABLE "public"."lessons" TO "service_role";



GRANT ALL ON TABLE "public"."mentorship_requests" TO "anon";
GRANT ALL ON TABLE "public"."mentorship_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."mentorship_requests" TO "service_role";



GRANT ALL ON TABLE "public"."mentorship_sessions" TO "anon";
GRANT ALL ON TABLE "public"."mentorship_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."mentorship_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."milestone_actions" TO "anon";
GRANT ALL ON TABLE "public"."milestone_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."milestone_actions" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_options" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_options" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_options" TO "service_role";



GRANT ALL ON TABLE "public"."opportunity_matches" TO "anon";
GRANT ALL ON TABLE "public"."opportunity_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."opportunity_matches" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."outcomes" TO "anon";
GRANT ALL ON TABLE "public"."outcomes" TO "authenticated";
GRANT ALL ON TABLE "public"."outcomes" TO "service_role";



GRANT ALL ON TABLE "public"."pending_verifications" TO "anon";
GRANT ALL ON TABLE "public"."pending_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_verifications" TO "service_role";



GRANT ALL ON TABLE "public"."playbook_records" TO "anon";
GRANT ALL ON TABLE "public"."playbook_records" TO "authenticated";
GRANT ALL ON TABLE "public"."playbook_records" TO "service_role";



GRANT ALL ON TABLE "public"."post_likes" TO "anon";
GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_likes" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_attempts" TO "anon";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_questions" TO "anon";
GRANT ALL ON TABLE "public"."quiz_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_questions" TO "service_role";



GRANT ALL ON TABLE "public"."quizzes" TO "anon";
GRANT ALL ON TABLE "public"."quizzes" TO "authenticated";
GRANT ALL ON TABLE "public"."quizzes" TO "service_role";



GRANT ALL ON TABLE "public"."reflections" TO "anon";
GRANT ALL ON TABLE "public"."reflections" TO "authenticated";
GRANT ALL ON TABLE "public"."reflections" TO "service_role";



GRANT ALL ON TABLE "public"."scholar_vault_items" TO "anon";
GRANT ALL ON TABLE "public"."scholar_vault_items" TO "authenticated";
GRANT ALL ON TABLE "public"."scholar_vault_items" TO "service_role";



GRANT ALL ON TABLE "public"."starting_five_invitations" TO "anon";
GRANT ALL ON TABLE "public"."starting_five_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."starting_five_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."student_activities" TO "anon";
GRANT ALL ON TABLE "public"."student_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."student_activities" TO "service_role";



GRANT ALL ON TABLE "public"."timeline_events" TO "anon";
GRANT ALL ON TABLE "public"."timeline_events" TO "authenticated";
GRANT ALL ON TABLE "public"."timeline_events" TO "service_role";



GRANT ALL ON TABLE "public"."trust_reports" TO "anon";
GRANT ALL ON TABLE "public"."trust_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."trust_reports" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."user_connections" TO "anon";
GRANT ALL ON TABLE "public"."user_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."user_connections" TO "service_role";



GRANT ALL ON TABLE "public"."verifications" TO "anon";
GRANT ALL ON TABLE "public"."verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."verifications" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";








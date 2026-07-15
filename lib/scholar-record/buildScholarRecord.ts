import type {
  ScholarRecord,
  ScholarRecordSource,
} from "./types";

import {
  firstDefined,
  normalizedArray,
  normalizedBoolean,
  normalizedObject,
  normalizedString,
} from "./normalize";

export function buildScholarRecord({
  profile,
  authEmail,
  agProgress,
  transcriptCourses,
}: ScholarRecordSource): ScholarRecord {
  const row = profile || {};
  const onboarding = normalizedObject(row.onboarding_data);

  const id = normalizedString(row.id) || "";

  const fullName = normalizedString(
    row.full_name,
    onboarding.full_name,
    [
      row.first_name || onboarding.first_name,
      row.last_name || onboarding.last_name,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const firstName = normalizedString(
    row.first_name,
    onboarding.first_name,
    fullName?.split(/\s+/)[0]
  );

  const lastName = normalizedString(
    row.last_name,
    onboarding.last_name,
    fullName?.split(/\s+/).slice(1).join(" ")
  );

  const storedTranscriptCourses =
    normalizedArray<Record<string, unknown>>(
      transcriptCourses,
      row.transcript_courses,
      onboarding.transcript_courses,
      onboarding.courses
    );

  const storedAgProgress =
    normalizedArray<Record<string, unknown>>(
      agProgress,
      row.ag_progress,
      onboarding.ag_progress
    );

  const transcriptUrl = normalizedString(
    row.transcript_url,
    onboarding.transcript_url,
    onboarding.transcript_upload_url
  );

  const transcriptFilename = normalizedString(
    row.transcript_filename,
    onboarding.transcript_filename
  );

  const transcriptUploadedAt = normalizedString(
    row.transcript_uploaded_at,
    onboarding.transcript_uploaded_at
  );

  return {
    id,

    identity: {
      id,
      email: normalizedString(
        authEmail,
        row.email,
        onboarding.email
      ),
      role:
        normalizedString(
          row.role,
          onboarding.role,
          "scholar"
        ) || "scholar",
      profileMode:
        normalizedString(
          row.profile_mode,
          onboarding.profile_mode,
          row.role,
          onboarding.role,
          "scholar"
        ) || "scholar",

      firstName,
      lastName,
      fullName,
      username: normalizedString(
        row.username,
        onboarding.username
      ),

      avatarUrl: normalizedString(
        row.avatar_url,
        onboarding.avatar_url
      ),
      coverUrl: normalizedString(
        row.cover_url,
        onboarding.cover_url
      ),
      bio: normalizedString(
        row.bio,
        onboarding.bio
      ),

      city: normalizedString(
        row.city,
        onboarding.city
      ),
      zipCode: normalizedString(
        row.zip_code,
        onboarding.zip_code,
        onboarding.zipCode
      ),
    },

    academic: {
      school: normalizedString(
        row.school,
        onboarding.school,
        onboarding.current_school
      ),

      schoolDistrict: normalizedString(
        row.school_district,
        row.district,
        onboarding.school_district,
        onboarding.district
      ),

      grade: normalizedString(
        row.grade,
        onboarding.grade
      ),

      graduationYear: firstDefined(
        row.graduation_year,
        row.grad_year,
        onboarding.graduation_year,
        onboarding.grad_year
      ),

      gpa: firstDefined(
        row.gpa,
        onboarding.gpa
      ),

      weightedGpa: firstDefined(
        row.weighted_gpa,
        onboarding.weighted_gpa,
        row.gpa,
        onboarding.gpa
      ),

      unweightedGpa: firstDefined(
        row.unweighted_gpa,
        onboarding.unweighted_gpa
      ),

      elaScore: firstDefined(
        row.ela_score,
        onboarding.ela_score
      ),

      mathScore: firstDefined(
        row.math_score,
        onboarding.math_score
      ),

      satScore: firstDefined(
        row.sat_score,
        onboarding.sat_score
      ),

      actScore: firstDefined(
        row.act_score,
        onboarding.act_score
      ),

      intendedMajor: normalizedString(
        row.intended_major,
        onboarding.intended_major,
        onboarding.target_major
      ),

      idealProfession: normalizedString(
        row.ideal_profession,
        onboarding.ideal_profession,
        onboarding.career_goal
      ),
    },

    college: {
      dreamSchool: normalizedString(
        row.dream_school,
        onboarding.dream_school,
        onboarding.dream_school_name
      ),

      dreamSchoolName: normalizedString(
        row.dream_school_name,
        onboarding.dream_school_name,
        row.dream_school,
        onboarding.dream_school
      ),

      dreamSchoolId: normalizedString(
        row.dream_school_id,
        onboarding.dream_school_id
      ),

      topSchools: normalizedArray<string>(
        row.top_schools,
        row.college_list,
        onboarding.top_schools,
        onboarding.college_list,
        onboarding.colleges
      ),
    },

    transcript: {
      uploaded:
        Boolean(transcriptUrl) ||
        Boolean(transcriptFilename) ||
        storedTranscriptCourses.length > 0 ||
        storedAgProgress.length > 0,

      uploadUrl: transcriptUrl,
      filename: transcriptFilename,
      uploadedAt: transcriptUploadedAt,

      courses: storedTranscriptCourses,
      agProgress: storedAgProgress,
    },

    community: {
      pillars: normalizedArray<string>(
        row.pillars,
        onboarding.pillars,
        onboarding.selected_pillars
      ),

      activities:
        normalizedArray<Record<string, unknown>>(
          row.activities,
          onboarding.activities,
          onboarding.activity_list,
          onboarding.extracurriculars
        ),

      engagementPreferences: normalizedArray<string>(
        row.engagement_preferences,
        onboarding.engagement_preferences
      ),

      supporters: normalizedArray<string>(
        row.supporters,
        onboarding.supporters,
        onboarding.invite_supporters
      ),
    },

    onboarding,

    onboardingComplete: normalizedBoolean(
      row.onboarding_complete,
      row.onboarding_completed
    ),

    publicProfileComplete: normalizedBoolean(
      row.public_profile_complete
    ),

    createdAt: normalizedString(row.created_at),

    updatedAt: normalizedString(
      row.updated_at,
      onboarding.last_saved_at
    ),
  };
}

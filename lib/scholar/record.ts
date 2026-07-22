import type { ScholarRecord } from "./types";

export function buildScholarRecord({
  profile = {},
  certificates = [],
  badges = [],
  activities = [],
  posts = [],
}: {
  profile?: any;
  certificates?: any[];
  badges?: any[];
  activities?: any[];
  posts?: any[];
}): ScholarRecord {
  const fullName =
    profile.full_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.username ||
    "Scholar";

  const volunteerHours = activities.reduce((sum, activity) => {
    return sum + Number(activity.hours || activity.volunteer_hours || 0);
  }, 0);

  const achievementsTotal =
    certificates.length + badges.length + activities.length + posts.length;

  const identityFields = [
    profile.username,
    fullName,
    profile.role,
    profile.bio,
    profile.avatar_url,
  ].filter(Boolean).length;

  const dreamSchool =
    profile.dream_school || profile.dream_school_name || null;
  const dreamSchoolName =
    profile.dream_school_name || profile.dream_school || null;
  const dreamSchoolId = profile.dream_school_id
    ? String(profile.dream_school_id)
    : null;
  const topSchools = Array.from({ length: 9 }, (_, index) => {
    const key = `college_list_${index + 2}`;
    return typeof profile[key] === "string" ? profile[key].trim() : "";
  });

  const academicFields = [
    profile.school,
    profile.grade,
    profile.gpa,
    dreamSchool,
  ].filter(Boolean).length;

  const careerFields = [
    profile.ideal_profession,
    profile.desired_salary_range,
  ].filter(Boolean).length;

  const portfolioCompletion = Math.min(
    100,
    Math.round(((identityFields + academicFields + careerFields) / 11) * 100)
  );

  const opportunityReadiness = Math.min(
    100,
    Math.round(
      portfolioCompletion * 0.55 +
      Math.min(achievementsTotal, 10) * 3 +
      Math.min(volunteerHours, 100) * 0.15
    )
  );

  return {
    id: profile.id,
    identity: {
      username: profile.username,
      role: profile.role,
      fullName,
      avatarUrl: profile.avatar_url || null,
      bio: profile.bio || null,
    },
    academics: {
      school: profile.school || null,
      grade: profile.grade || null,
      gpa: profile.gpa || null,
      dreamSchool,
    },
    college: {
      dreamSchool,
      dreamSchoolName,
      dreamSchoolId,
      topSchools,
    },
    career: {
      idealProfession: profile.ideal_profession || null,
      desiredSalaryRange: profile.desired_salary_range || null,
    },
    achievements: {
      total: achievementsTotal,
      certificates,
      badges,
      activities,
      posts,
    },
    service: {
      volunteerHours,
    },
    readiness: {
      portfolioCompletion,
      opportunityReadiness,
    },
  };
}

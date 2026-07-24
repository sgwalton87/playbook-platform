import type { ScholarRecord } from "./types";
import { buildCommunityRecord, type RawCommunityActivity } from "./community";

interface ScholarProfileInput {
  id?: string;
  username?: string;
  role?: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  school?: string | null;
  grade?: string | null;
  gpa?: string | null;
  dream_school?: string | null;
  college_list_2?: string | null;
  college_list_3?: string | null;
  college_list_4?: string | null;
  college_list_5?: string | null;
  college_list_6?: string | null;
  college_list_7?: string | null;
  college_list_8?: string | null;
  college_list_9?: string | null;
  college_list_10?: string | null;
  onboarding_data?: { top_schools?: unknown } | null;
  ideal_profession?: string | null;
  desired_salary_range?: string | null;
}


export function buildScholarRecord({
  profile = {},
  certificates = [],
  badges = [],
  activities = [],
  posts = [],
}: {
  profile?: ScholarProfileInput;
  certificates?: unknown[];
  badges?: unknown[];
  activities?: RawCommunityActivity[];
  posts?: unknown[];
}): ScholarRecord {
  const fullName =
    profile.full_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.username ||
    "Scholar";

  const onboardingTopSchools = Array.isArray(profile.onboarding_data?.top_schools)
    ? profile.onboarding_data.top_schools.map((school) => String(school || "").trim()).filter(Boolean)
    : [];
  const columnCollegeList = [
    profile.college_list_2,
    profile.college_list_3,
    profile.college_list_4,
    profile.college_list_5,
    profile.college_list_6,
    profile.college_list_7,
    profile.college_list_8,
    profile.college_list_9,
    profile.college_list_10,
  ];
  const collegeList = (columnCollegeList.some(Boolean) ? columnCollegeList : onboardingTopSchools)
    .map((school) => String(school || "").trim())
    .filter(Boolean);
  const dreamSchool = profile.dream_school || onboardingTopSchools[0] || null;
  const topSchools = [dreamSchool, ...collegeList]
    .map((school) => String(school || "").trim())
    .filter((school, index, schools) => school && schools.findIndex((item) => item.toLowerCase() === school.toLowerCase()) === index)
    .slice(0, 10);

  const community = buildCommunityRecord(activities);
  const volunteerHours = community.volunteerHours;

  const achievementsTotal =
    certificates.length + badges.length + activities.length + posts.length;

  const identityFields = [
    profile.username,
    fullName,
    profile.role,
    profile.bio,
    profile.avatar_url,
  ].filter(Boolean).length;

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
    id: profile.id || "",
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
      topSchools,
      collegeList,
    },
    career: {
      idealProfession: profile.ideal_profession || null,
      desiredSalaryRange: profile.desired_salary_range || null,
    },
    achievements: {
      total: achievementsTotal,
      certificates,
      badges,
      activities: community.activities,
      posts,
    },
    community,
    service: {
      volunteerHours,
      activities: community.activities,
    },
    leadership: {
      badges,
      activities: community.activities,
      leadershipPositions: community.leadershipPositions,
      leadershipScore: badges.length * 10 + community.leadershipPositions.length * 12 + community.activities.length * 3,
    },
    readiness: {
      portfolioCompletion,
      opportunityReadiness,
    },
  };
}

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
    profile.dream_school,
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
      dreamSchool: profile.dream_school || null,
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

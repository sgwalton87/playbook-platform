import type { ScholarRecord } from "./types";
import { buildCommunityRecord, type RawCommunityActivity } from "./community";
import { buildCanonicalAIProfile } from "../portfolio/ai-foundation";

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

  const canonicalAIProfile = buildCanonicalAIProfile({
    rawProfile: profile,
    portfolio: {
      identity: {
        id: profile.id || "",
        username: profile.username,
        role: profile.role,
        firstName: profile.first_name,
        lastName: profile.last_name,
        fullName,
        avatarUrl: profile.avatar_url || null,
        bio: profile.bio || null,
        school: profile.school || null,
        grade: profile.grade || null,
      },
      academics: {
        weightedGpa: profile.gpa || null,
        unweightedGpa: null,
        dreamSchool: profile.dream_school || null,
        intendedMajor: null,
        satScore: null,
        actScore: null,
      },
      career: {
        idealProfession: profile.ideal_profession || null,
        desiredSalaryRange: profile.desired_salary_range || null,
      },
      athletics: {},
      pillars: [],
    },
    certificates,
    badges,
    badgeRows: badges,
    activities,
    posts,
    intelligence: { completion: { percent: portfolioCompletion } },
  });

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
    canonicalAIProfile,
    canonicalResume: canonicalAIProfile.resume,
    canonicalScholarship: canonicalAIProfile.scholarship,
    canonicalRecruiting: canonicalAIProfile.recruiting,
    canonicalAcademicSummary: canonicalAIProfile.academics,
    canonicalStudentSnapshot: canonicalAIProfile.studentSnapshot,
  };
}

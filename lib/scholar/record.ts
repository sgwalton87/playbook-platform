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
  location?: string | null;
  cover_photo_url?: string | null;
  cover_url?: string | null;
  sat_score?: string | number | null;
  act_score?: string | number | null;
  intended_major?: string | null;
  college_goals?: string | null;
  sport?: string | null;
  position?: string | null;
  travel_team?: string | null;
  coach_name?: string | null;
  recruiting_status?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  website?: string | null;
  xp?: number | null;
  coin_balance?: number | null;
  is_public?: boolean | null;
  public_profile?: boolean | null;
  public_profile_visible?: boolean | null;
}


export function buildScholarRecord({
  profile = {},
  certificates = [],
  badges = [],
  activities = [],
  posts = [],
  gallery = [],
  endorsements = [],
  recommendations = [],
}: {
  profile?: ScholarProfileInput;
  certificates?: unknown[];
  badges?: unknown[];
  activities?: RawCommunityActivity[];
  posts?: unknown[];
  gallery?: string[];
  endorsements?: unknown[];
  recommendations?: unknown[];
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

  const academicReadiness = Math.min(100, Math.round((academicFields / 4) * 100));
  const careerReadiness = Math.min(100, Math.round((careerFields / 2) * 100));
  const leadershipReadiness = Math.min(
    100,
    Math.round(Math.min(badges.length * 10 + community.leadershipPositions.length * 20, 100))
  );
  const opportunityReadiness = Math.min(
    100,
    Math.round(
      portfolioCompletion * 0.55 +
      Math.min(achievementsTotal, 10) * 3 +
      Math.min(volunteerHours, 100) * 0.15
    )
  );

  const isPublic = profile.public_profile_visible ?? profile.public_profile ?? profile.is_public ?? true;
  const sectionVisibility = {
    identity: true,
    biography: true,
    academics: true,
    goals: true,
    activities: true,
    leadership: true,
    athletics: true,
    awards: true,
    certifications: true,
    badges: true,
    social: true,
    stats: true,
    media: true,
    endorsements: false,
    recommendations: false,
  };

  return {
    id: profile.id || "",
    identity: {
      username: profile.username,
      role: profile.role,
      fullName,
      avatarUrl: profile.avatar_url || null,
      bio: profile.bio || null,
      location: profile.location || null,
    },
    media: {
      avatarUrl: profile.avatar_url || null,
      coverPhotoUrl: profile.cover_photo_url || profile.cover_url || null,
      gallery,
    },
    visibility: {
      isPublic: Boolean(isPublic),
      sections: sectionVisibility,
      rules: sectionVisibility,
    },
    academics: {
      school: profile.school || null,
      grade: profile.grade || null,
      gpa: profile.gpa || null,
      dreamSchool: profile.dream_school || null,
      sat: profile.sat_score || null,
      act: profile.act_score || null,
      intendedMajor: profile.intended_major || null,
    },
    goals: {
      collegeGoals: profile.college_goals || null,
      dreamSchool: profile.dream_school || null,
      intendedMajor: profile.intended_major || null,
    },
    athletics: {
      sport: profile.sport || null,
      position: profile.position || null,
      travelTeam: profile.travel_team || null,
      coachName: profile.coach_name || null,
      recruitingStatus: profile.recruiting_status || null,
    },
    career: {
      idealProfession: profile.ideal_profession || null,
      desiredSalaryRange: profile.desired_salary_range || null,
    },
    social: {
      instagram: profile.instagram || null,
      twitter: profile.twitter || null,
      tiktok: profile.tiktok || null,
      youtube: profile.youtube || null,
      linkedin: profile.linkedin || null,
      website: profile.website || null,
    },
    achievements: {
      total: achievementsTotal,
      certificates,
      badges,
      activities: community.activities,
      awards: community.awards,
      certifications: community.certifications,
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
    stats: {
      xp: Number(profile.xp ?? 0),
      coins: Number(profile.coin_balance ?? 0),
      certificates: certificates.length,
      badges: badges.length,
      posts: posts.length,
      activities: community.activities.length,
    },
    readiness: {
      portfolioCompletion,
      academicReadiness,
      careerReadiness,
      leadershipReadiness,
      opportunityReadiness,
    },
    future: {
      endorsements,
      recommendations,
    },
  };
}

import type { ScholarRecord } from "./types";
import { buildCommunityRecord, type RawCommunityActivity } from "./community";
import { buildAcademics, buildAthletics, buildCareer, buildIdentity } from "./modules";

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
  weighted_gpa?: string | null;
  unweighted_gpa?: string | null;
  intended_major?: string | null;
  sat_score?: string | null;
  act_score?: string | null;
  sport?: string | null;
  position?: string | null;
  height?: string | null;
  weight?: string | null;
  coach_name?: string | null;
  coach_email?: string | null;
  travel_team?: string | null;
  recruiting_status?: string | null;
  recruiting_interest?: string | null;
  highlight_video?: string | null;
  highlight_reel_url?: string | null;
  coin_balance?: number | string | null;
  xp?: number | string | null;
}


export function buildScholarRecord({
  profile = {},
  certificates = [],
  badges = [],
  activities = [],
  posts = [],
  agProgress = [],
  notifications = [],
  upcomingDeadlines = [],
}: {
  profile?: ScholarProfileInput;
  certificates?: unknown[];
  badges?: unknown[];
  activities?: RawCommunityActivity[];
  posts?: unknown[];
  agProgress?: ScholarRecord["progress"]["ag"];
  notifications?: ScholarRecord["activity"]["notifications"];
  upcomingDeadlines?: ScholarRecord["activity"]["upcomingDeadlines"];
}): ScholarRecord {
  const identity = buildIdentity(profile);
  const fullName = identity.fullName || profile.username || "Scholar";
  const academics = buildAcademics(profile);
  const career = buildCareer(profile);
  const athletics = buildAthletics(profile);

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

  const totalRequired = agProgress.reduce((sum, row) => sum + Number(row.years_required ?? 0), 0);
  const totalCompleted = agProgress.reduce((sum, row) => sum + Math.min(Number(row.years_completed ?? 0), Number(row.years_required ?? 0)), 0);
  const transcriptCompletion = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
  const collegeReadiness = Math.round((transcriptCompletion * 0.65) + (opportunityReadiness * 0.35));
  const recent = [
    ...activities.slice(0, 3).map((activity, index) => ({
      id: activity.id || `activity-${index}`,
      label: activity.activity_name || activity.title || activity.name || "Activity added",
      detail: activity.activity_type || null,
      createdAt: activity.created_at || null,
      href: "/transcript",
    })),
    ...certificates.slice(0, 2).map((certificate, index) => {
      const item = certificate as { id?: string; title?: string; name?: string; issued_at?: string; created_at?: string };
      return {
        id: item.id || `certificate-${index}`,
        label: item.title || item.name || "Certificate earned",
        detail: "Certificate",
        createdAt: item.issued_at || item.created_at || null,
        href: "/certificates",
      };
    }),
  ].slice(0, 5);

  return {
    id: profile.id || "",
    identity: {
      username: identity.username,
      role: identity.role,
      fullName,
      avatarUrl: identity.avatarUrl || null,
      bio: profile.bio || null,
    },
    academics: {
      school: profile.school || null,
      grade: profile.grade || null,
      gpa: academics.gpa || null,
      dreamSchool: academics.dreamSchool || null,
      weightedGpa: academics.weightedGpa || null,
      unweightedGpa: academics.unweightedGpa || null,
      intendedMajor: academics.intendedMajor || null,
      sat: academics.sat || null,
      act: academics.act || null,
    },
    athletics,
    career,
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
      transcriptCompletion,
      collegeReadiness,
    },
    progress: { ag: agProgress },
    economy: {
      coins: Number(profile.coin_balance ?? 0),
      xp: Number(profile.xp ?? 0),
    },
    activity: { recent, notifications, upcomingDeadlines },
  };
}

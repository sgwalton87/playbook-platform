import type { ScholarRecord } from "./types";
import {
  buildIdentity,
  buildAcademics,
  buildAthletics,
  buildLeadership,
  buildService,
  buildCareer,
  buildAchievements,
} from "./modules";

function score(values: any[]) {
  if (!values.length) return 0;
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

export function buildScholarRecord({
  profile,
  certificates = [],
  badges = [],
  activities = [],
  posts = [],
}: {
  profile: any;
  certificates?: any[];
  badges?: any[];
  activities?: any[];
  posts?: any[];
}): ScholarRecord {
  const identity = buildIdentity(profile);
  const academics = buildAcademics(profile);
  const athletics = buildAthletics(profile);
  const career = buildCareer(profile);
  const leadership = buildLeadership(badges, activities);
  const service = buildService(activities);
  const achievements = buildAchievements({
    certificates,
    badges,
    activities,
    posts,
  });

  const academicReadiness = score([
    identity.school,
    identity.grade,
    academics.gpa || academics.weightedGpa || academics.unweightedGpa,
    academics.dreamSchool,
    academics.sat || academics.act,
  ]);

  const careerReadiness = score([
    career.idealProfession,
    career.desiredSalaryRange,
    certificates.length > 0,
    activities.length > 0,
  ]);

  const leadershipReadiness = score([
    badges.length > 0,
    activities.length > 0,
    posts.length > 0,
  ]);

  const portfolioCompletion = score([
    identity.avatarUrl,
    identity.firstName,
    identity.lastName,
    identity.username,
    identity.school,
    profile?.bio,
    academics.dreamSchool,
    career.idealProfession,
    certificates.length > 0,
    badges.length > 0,
  ]);

  const opportunityReadiness = Math.round(
    (academicReadiness +
      careerReadiness +
      leadershipReadiness +
      portfolioCompletion) /
      4
  );

  return {
    id: identity.id,
    username: identity.username,
    role: identity.role,

    identity,
    academics,
    career,
    athletics,

    achievements,

    readiness: {
      portfolioCompletion,
      academicReadiness,
      careerReadiness,
      opportunityReadiness,
      leadershipReadiness,
    },

    // Engine extensions
    leadership,
    service,
  } as ScholarRecord & {
    leadership: any;
    service: any;
  };
}

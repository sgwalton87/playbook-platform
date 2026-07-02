import type { ScholarRecord } from "./types";

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
  const fullName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  const academicReadiness = score([
    profile?.school,
    profile?.grade,
    profile?.gpa || profile?.weighted_gpa || profile?.unweighted_gpa,
    profile?.dream_school,
    profile?.sat_score || profile?.act_score,
  ]);

  const careerReadiness = score([
    profile?.ideal_profession,
    profile?.desired_salary_range,
    certificates.length > 0,
    activities.length > 0,
  ]);

  const leadershipReadiness = score([
    badges.length > 0,
    activities.length > 0,
    posts.length > 0,
  ]);

  const portfolioCompletion = score([
    profile?.avatar_url,
    profile?.first_name,
    profile?.last_name,
    profile?.username,
    profile?.school,
    profile?.bio,
    profile?.dream_school,
    profile?.ideal_profession,
    certificates.length > 0,
    badges.length > 0,
  ]);

  const opportunityReadiness = Math.round(
    (academicReadiness + careerReadiness + leadershipReadiness + portfolioCompletion) / 4
  );

  return {
    id: profile?.id,
    username: profile?.username,
    role: profile?.role,

    identity: {
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      fullName,
      avatarUrl: profile?.avatar_url,
      school: profile?.school,
      grade: profile?.grade,
      graduationYear: profile?.graduation_year || profile?.grad_year,
    },

    academics: {
      gpa: profile?.gpa,
      weightedGpa: profile?.weighted_gpa,
      unweightedGpa: profile?.unweighted_gpa,
      dreamSchool: profile?.dream_school,
      intendedMajor: profile?.intended_major,
      satScore: profile?.sat_score,
      actScore: profile?.act_score,
    },

    career: {
      idealProfession: profile?.ideal_profession,
      desiredSalaryRange: profile?.desired_salary_range,
    },

    athletics: {
      sport: profile?.sport,
      position: profile?.position,
      coachName: profile?.coach_name,
      travelTeam: profile?.travel_team,
      recruitingStatus: profile?.recruiting_status || profile?.recruiting_interest,
      highlightVideo: profile?.highlight_video || profile?.highlight_reel_url,
    },

    achievements: {
      certificates,
      badges,
      activities,
      posts,
    },

    readiness: {
      portfolioCompletion,
      academicReadiness,
      careerReadiness,
      opportunityReadiness,
      leadershipReadiness,
    },
  };
}

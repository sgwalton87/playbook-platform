import { Portfolio } from "../types";

export function mapProfileToPortfolio(profile: any): Portfolio {
  return {
    identity: {
      id: profile.id,
      username: profile.username,
      role: profile.role,
      firstName: profile.first_name,
      lastName: profile.last_name,
      fullName: profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(" "),
      avatarUrl: profile.avatar_url,
      bannerUrl: profile.banner_url,
      bio: profile.bio,
      school: profile.school,
      city: profile.city,
      state: profile.state,
      grade: profile.grade,
      graduationYear: profile.grad_year,
    },
    academics: {
      weightedGpa: profile.weighted_gpa || profile.gpa,
      unweightedGpa: profile.unweighted_gpa,
      dreamSchool: profile.dream_school,
      intendedMajor: profile.intended_major,
      satScore: profile.sat_score,
      actScore: profile.act_score,
    },
    career: {
      idealProfession: profile.ideal_profession,
      desiredSalaryRange: profile.desired_salary_range,
    },
    athletics: {
      sport: profile.sport,
      position: profile.position,
      height: profile.height,
      weight: profile.weight,
      travelTeam: profile.travel_team,
      coachName: profile.coach_name,
      coachEmail: profile.coach_email,
      recruitingStatus: profile.recruiting_status || profile.recruiting_interest,
      highlightVideo: profile.highlight_video || profile.highlight_reel_url,
    },
    pillars: profile.pillars || [],
  };
}

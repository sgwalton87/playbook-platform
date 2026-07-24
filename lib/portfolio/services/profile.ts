import { Portfolio } from "../types";

export function getCollegeGoalsFromProfile(profile: any) {
  const onboardingTopSchools = Array.isArray(profile?.onboarding_data?.top_schools)
    ? profile.onboarding_data.top_schools
    : [];

  const columnCollegeList = [
    profile?.college_list_2,
    profile?.college_list_3,
    profile?.college_list_4,
    profile?.college_list_5,
    profile?.college_list_6,
    profile?.college_list_7,
    profile?.college_list_8,
    profile?.college_list_9,
    profile?.college_list_10,
  ];

  const collegeList = (columnCollegeList.some(Boolean) ? columnCollegeList : onboardingTopSchools)
    .map((school: unknown) => String(school || "").trim())
    .filter(Boolean);

  const dreamSchool = String(profile?.dream_school || onboardingTopSchools[0] || "").trim();
  const topSchools = [dreamSchool, ...collegeList]
    .map((school) => school.trim())
    .filter((school, index, schools) => school && schools.findIndex((item) => item.toLowerCase() === school.toLowerCase()) === index)
    .slice(0, 10);

  return { dreamSchool: dreamSchool || null, collegeList, topSchools };
}

export function scholarRecordToProfileForm(record: any) {
  const academics = record?.academics || record?.portfolio?.academics || {};
  const topSchools = Array.isArray(academics.topSchools) ? academics.topSchools : [];
  const dreamSchool = academics.dreamSchool || topSchools[0] || "";
  const collegeList = Array.isArray(academics.collegeList)
    ? academics.collegeList
    : topSchools.filter((school: string) => school !== dreamSchool);

  return {
    dream_school: dreamSchool,
    top_schools: topSchools,
    college_list_2: collegeList[0] || "",
    college_list_3: collegeList[1] || "",
    college_list_4: collegeList[2] || "",
    college_list_5: collegeList[3] || "",
    college_list_6: collegeList[4] || "",
    college_list_7: collegeList[5] || "",
    college_list_8: collegeList[6] || "",
    college_list_9: collegeList[7] || "",
    college_list_10: collegeList[8] || "",
  };
}

export function mapProfileToPortfolio(profile: any): Portfolio {
  const collegeGoals = getCollegeGoalsFromProfile(profile);
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
      dreamSchool: collegeGoals.dreamSchool,
      topSchools: collegeGoals.topSchools,
      collegeList: collegeGoals.collegeList,
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

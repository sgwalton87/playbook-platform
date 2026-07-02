export function createRecommendationContext(portfolio: any) {
  return {
    scholarName: portfolio?.identity?.fullName || "Scholar",
    school: portfolio?.identity?.school,
    careerGoal: portfolio?.career?.idealProfession,
    dreamSchool: portfolio?.academics?.dreamSchool,
    pillars: portfolio?.pillars || [],
  };
}

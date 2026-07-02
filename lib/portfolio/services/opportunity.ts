export function getOpportunitySignals(portfolio: any) {
  return {
    careerGoal: portfolio?.career?.idealProfession,
    dreamSchool: portfolio?.academics?.dreamSchool,
    grade: portfolio?.identity?.grade,
    pillars: portfolio?.pillars || [],
  };
}

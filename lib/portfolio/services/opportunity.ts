export function getOpportunitySignals(portfolio: LegacyValue) {
  return {
    careerGoal: portfolio?.career?.idealProfession,
    dreamSchool: portfolio?.academics?.dreamSchool,
    grade: portfolio?.identity?.grade,
    pillars: portfolio?.pillars || [],
  };
}

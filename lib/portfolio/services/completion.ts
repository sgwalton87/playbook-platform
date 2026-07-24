export function calculatePortfolioCompletion(portfolio: LegacyValue) {
  const checks = [
    portfolio?.identity?.avatarUrl,
    portfolio?.identity?.bannerUrl,
    portfolio?.identity?.bio,
    portfolio?.identity?.school,
    portfolio?.identity?.grade,
    portfolio?.identity?.graduationYear,
    portfolio?.academics?.weightedGpa || portfolio?.academics?.unweightedGpa,
    portfolio?.academics?.dreamSchool,
    portfolio?.career?.idealProfession,
    portfolio?.career?.desiredSalaryRange,
    (portfolio?.pillars || []).length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  const total = checks.length;

  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

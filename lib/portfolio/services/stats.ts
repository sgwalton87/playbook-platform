export function calculatePortfolioStats(portfolio: any) {
  return {
    level: 8,
    xp: 12450,
    coins: 3250,
    skills: portfolio?.pillars?.length ?? 0,
    certificates: 0,
    courses: 0,
    leadership: 0,
    volunteerHours: 0,
  };
}

// Backward-compatible alias
export const buildPortfolioStats = calculatePortfolioStats;

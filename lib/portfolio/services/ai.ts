export function buildPortfolioAIContext(portfolio: LegacyValue) {
  return {
    identity: portfolio.identity,
    academics: portfolio.academics,
    career: portfolio.career,
    athletics: portfolio.athletics,
    pillars: portfolio.pillars,
  };
}

import { buildPortfolioAIContext } from "./services/ai";
import { generateResumeDraft } from "./services/resume";
import { createRecommendationContext } from "./services/recommendation";
import { getOpportunitySignals } from "./services/opportunity";

export function buildPlaybookRecord(assembled: any) {
  const portfolio = assembled.portfolio;

  return {
    id: portfolio.identity.id,
    rawProfile: assembled.rawProfile,

    portfolio,

    identity: portfolio.identity,
    academics: portfolio.academics,
    career: portfolio.career,
    athletics: portfolio.athletics,
    pillars: portfolio.pillars,

    certificates: assembled.certificates || [],
    badges: assembled.badgeRows || [],
    activities: assembled.activities || [],
    posts: assembled.posts || [],

    intelligence: assembled.intelligence,

    resumeDraft: generateResumeDraft(portfolio),
    recommendationContext: createRecommendationContext(portfolio),
    opportunitySignals: getOpportunitySignals(portfolio),
    aiContext: buildPortfolioAIContext(portfolio),
  };
}

import { buildPortfolioAIContext } from "./services/ai";
import { generateResumeDraft } from "./services/resume";
import { createRecommendationContext } from "./services/recommendation";
import { getOpportunitySignals } from "./services/opportunity";
import { buildCanonicalAIProfile } from "./ai-foundation";

export function buildScholarRecord(assembled: LegacyValue) {
  const portfolio = assembled.portfolio;
  const canonicalAIProfile = buildCanonicalAIProfile(assembled as unknown as Record<string, unknown>);

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
    canonicalAIProfile,
    canonicalResume: canonicalAIProfile.resume,
    canonicalScholarship: canonicalAIProfile.scholarship,
    canonicalRecruiting: canonicalAIProfile.recruiting,
    canonicalAcademicSummary: canonicalAIProfile.academics,
    canonicalStudentSnapshot: canonicalAIProfile.studentSnapshot,
  };
}

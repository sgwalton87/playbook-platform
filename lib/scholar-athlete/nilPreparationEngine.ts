export type NILPreparationDimension =
  | "personal_brand"
  | "financial_literacy"
  | "contract_awareness"
  | "compliance_awareness"
  | "media_kit"
  | "social_professionalism"
  | "opportunity_tracking";

export type NILPreparationReviewStatus =
  | "not_started"
  | "in_progress"
  | "reviewed"
  | "action_needed";

export type NILPreparationReview = {
  dimension: NILPreparationDimension;
  reviewStatus: NILPreparationReviewStatus;
  reflection?: string | null;
  reviewedAt?: string | null;
};

export type NILPreparationFacts = {
  profile: {
    hasAvatar: boolean;
    hasCover: boolean;
    hasBio: boolean;
    linkedSocialCount: number;
    brandInterestCount: number;
  };
  athlete: {
    hasHighlightFilm: boolean;
  };
  media: {
    albumMediaCount: number;
  };
  learning: {
    moneyInTheGameRequiredModules: number;
    moneyInTheGameCompletedModules: number;
    moneyInTheGameCredential: boolean;
    nilReadinessCourseStatus: "published" | "coming_soon" | "missing";
  };
  deals: {
    total: number;
    withContractRecord: number;
    disclosureStarted: number;
  };
};

export type NILPreparationFinding = {
  dimension: NILPreparationDimension;
  title: string;
  reviewStatus: NILPreparationReviewStatus;
  signal: "record_backed" | "partial_record" | "no_record_signal";
  evidence: string[];
  nextAction: string;
  authorityBoundary?: string;
};

const TITLES: Record<NILPreparationDimension, string> = {
  personal_brand: "Personal brand foundation",
  financial_literacy: "Financial literacy",
  contract_awareness: "Contract awareness",
  compliance_awareness: "Compliance awareness",
  media_kit: "Media kit building blocks",
  social_professionalism: "Social media professionalism",
  opportunity_tracking: "Opportunity tracking",
};

function reviewFor(
  reviews: NILPreparationReview[],
  dimension: NILPreparationDimension
): NILPreparationReview {
  return reviews.find((review) => review.dimension === dimension) || {
    dimension,
    reviewStatus: "not_started",
  };
}

export function evaluateNILPreparation(
  facts: NILPreparationFacts,
  reviews: NILPreparationReview[]
): NILPreparationFinding[] {
  const profileSignals = [facts.profile.hasAvatar, facts.profile.hasCover, facts.profile.hasBio]
    .filter(Boolean).length;
  const mediaSignals = [facts.profile.hasAvatar, facts.profile.hasCover, facts.profile.hasBio, facts.athlete.hasHighlightFilm]
    .filter(Boolean).length + (facts.media.albumMediaCount > 0 ? 1 : 0);
  const moneyComplete = facts.learning.moneyInTheGameRequiredModules > 0
    && facts.learning.moneyInTheGameCompletedModules >= facts.learning.moneyInTheGameRequiredModules;

  return [
    {
      dimension: "personal_brand",
      title: TITLES.personal_brand,
      reviewStatus: reviewFor(reviews, "personal_brand").reviewStatus,
      signal: profileSignals >= 3 && facts.profile.brandInterestCount > 0
        ? "record_backed"
        : profileSignals > 0 || facts.profile.brandInterestCount > 0
          ? "partial_record"
          : "no_record_signal",
      evidence: [
        `${profileSignals}/3 public-profile brand basics present (avatar, cover, bio)`,
        `${facts.profile.brandInterestCount} NIL brand interest${facts.profile.brandInterestCount === 1 ? "" : "s"} recorded`,
      ],
      nextAction: "Review how your profile communicates who you are, what you care about, and which partnerships fit your values.",
    },
    {
      dimension: "financial_literacy",
      title: TITLES.financial_literacy,
      reviewStatus: reviewFor(reviews, "financial_literacy").reviewStatus,
      signal: moneyComplete || facts.learning.moneyInTheGameCredential
        ? "record_backed"
        : facts.learning.moneyInTheGameCompletedModules > 0
          ? "partial_record"
          : "no_record_signal",
      evidence: [
        `Money in the Game: ${facts.learning.moneyInTheGameCompletedModules}/${facts.learning.moneyInTheGameRequiredModules} required modules completed`,
        facts.learning.moneyInTheGameCredential ? "Money in the Game credential earned" : "Money in the Game credential not yet recorded",
      ],
      nextAction: moneyComplete
        ? "Use the financial concepts you learned to evaluate compensation, taxes, saving, and cash-flow questions before accepting a deal."
        : "Continue the published Money in the Game course in Playbook Learning.",
      authorityBoundary: "Learning completion demonstrates coursework, not individualized tax, accounting, investment, or legal advice.",
    },
    {
      dimension: "contract_awareness",
      title: TITLES.contract_awareness,
      reviewStatus: reviewFor(reviews, "contract_awareness").reviewStatus,
      signal: facts.deals.withContractRecord > 0 ? "record_backed" : facts.deals.total > 0 ? "partial_record" : "no_record_signal",
      evidence: [
        `${facts.deals.total} NIL opportunit${facts.deals.total === 1 ? "y" : "ies"} tracked`,
        `${facts.deals.withContractRecord} with a contract record beyond “not received”`,
      ],
      nextAction: "Review deliverables, compensation, term, usage rights, exclusivity, termination, and payment obligations with an authorized reviewer when appropriate.",
      authorityBoundary: "Playbook organizes contract status; it does not approve a contract or provide legal advice.",
    },
    {
      dimension: "compliance_awareness",
      title: TITLES.compliance_awareness,
      reviewStatus: reviewFor(reviews, "compliance_awareness").reviewStatus,
      signal: facts.deals.disclosureStarted > 0 ? "record_backed" : facts.deals.total > 0 ? "partial_record" : "no_record_signal",
      evidence: [
        `${facts.deals.disclosureStarted}/${facts.deals.total} tracked deals have a disclosure workflow beyond “not started”`,
        `Dedicated NIL Readiness course: ${facts.learning.nilReadinessCourseStatus.replaceAll("_", " ")}`,
      ],
      nextAction: "Confirm the rules that apply to your school, state, conference, governing body, and specific deal before acting.",
      authorityBoundary: "A Scholar review or green Playbook signal is never compliance clearance. Applicable authorities make those determinations.",
    },
    {
      dimension: "media_kit",
      title: TITLES.media_kit,
      reviewStatus: reviewFor(reviews, "media_kit").reviewStatus,
      signal: mediaSignals >= 4 ? "record_backed" : mediaSignals > 0 ? "partial_record" : "no_record_signal",
      evidence: [
        `${mediaSignals}/5 media-kit building-block signals present (avatar, cover, bio, highlight film, album media)`,
        `${facts.media.albumMediaCount} profile media item${facts.media.albumMediaCount === 1 ? "" : "s"} recorded`,
      ],
      nextAction: "Use your existing profile, film, achievements, and media as source material for a concise partner-facing media kit.",
    },
    {
      dimension: "social_professionalism",
      title: TITLES.social_professionalism,
      reviewStatus: reviewFor(reviews, "social_professionalism").reviewStatus,
      signal: facts.profile.linkedSocialCount > 0 ? "partial_record" : "no_record_signal",
      evidence: [`${facts.profile.linkedSocialCount} social profile${facts.profile.linkedSocialCount === 1 ? "" : "s"} linked in the Playbook profile`],
      nextAction: "Review public-facing accounts for accuracy, consistency, privacy choices, respectful conduct, and alignment with how you want partners to understand you.",
      authorityBoundary: "Playbook does not infer professionalism, character, or suitability from social-account presence or follower count.",
    },
    {
      dimension: "opportunity_tracking",
      title: TITLES.opportunity_tracking,
      reviewStatus: reviewFor(reviews, "opportunity_tracking").reviewStatus,
      signal: facts.deals.total > 0 ? "record_backed" : "no_record_signal",
      evidence: [`${facts.deals.total} real NIL opportunit${facts.deals.total === 1 ? "y" : "ies"} recorded in the private deal tracker`],
      nextAction: facts.deals.total > 0
        ? "Keep stage, contract, disclosure, deliverables, and payment status current as each real opportunity changes."
        : "Add an opportunity only when a real brand or organization relationship exists.",
    },
  ];
}

export function summarizeNILPreparation(findings: NILPreparationFinding[]) {
  return {
    dimensions: findings.length,
    reviewed: findings.filter((finding) => finding.reviewStatus === "reviewed").length,
    actionNeeded: findings.filter((finding) => finding.reviewStatus === "action_needed").length,
    recordBacked: findings.filter((finding) => finding.signal === "record_backed").length,
  };
}

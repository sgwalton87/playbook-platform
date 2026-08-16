export type AthleteAbroadEvidence = {
  destinationRegions: string[];
  passportReadiness: string;
  eligibilityContext: string;
  supportNeeds: string[];
};

const text = (value: unknown) => String(value ?? "").trim();
const list = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export function buildAthleteAbroadEvidence(data: Record<string, unknown>): AthleteAbroadEvidence {
  const evidence = {
    destinationRegions: list(data.destination_regions),
    passportReadiness: text(data.passport_readiness),
    eligibilityContext: text(data.eligibility_context),
    supportNeeds: list(data.international_support_needs),
  };
  if (evidence.destinationRegions.length === 0 || !evidence.passportReadiness || !evidence.eligibilityContext) {
    throw new Error("Athlete Abroad readiness requires destination regions, passport readiness, and eligibility context.");
  }
  return evidence;
}

export function globalCapabilityReady(input: {
  identityOwned: boolean;
  readinessReviewed: boolean;
  jurisdictionScopeApproved: boolean;
}) {
  return input.identityOwned && input.readinessReviewed && input.jurisdictionScopeApproved;
}

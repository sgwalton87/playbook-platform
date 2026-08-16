export type EmployerVerificationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface EmployerVerificationEvidence {
  organizationName: string;
  officialEmail: string;
  organizationWebsite: string | null;
  opportunityTypes: string[];
  candidateAudience: string | null;
}

const text = (value: unknown) => String(value ?? "").trim();
const list = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export function buildEmployerVerificationEvidence(data: Record<string, unknown>): EmployerVerificationEvidence {
  const evidence = {
    organizationName: text(data.organization_name),
    officialEmail: text(data.official_email),
    organizationWebsite: text(data.organization_website) || null,
    opportunityTypes: list(data.opportunity_types),
    candidateAudience: text(data.candidate_audience) || null,
  };
  if (!evidence.organizationName || !evidence.officialEmail) {
    throw new Error("Employer verification requires organization name and official work email.");
  }
  return evidence;
}

export function employerAuthorityReady(input: { verificationStatus: EmployerVerificationStatus; hasApprovedOpportunityScope: boolean }) {
  return input.verificationStatus === "approved" && input.hasApprovedOpportunityScope;
}

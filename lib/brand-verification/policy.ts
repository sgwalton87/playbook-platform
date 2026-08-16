export type BrandVerificationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface BrandVerificationEvidence {
  organizationName: string;
  partnerTitle: string | null;
  brandCategory: string | null;
  partnershipGoals: string[];
  targetAudience: string[];
  monthlyBudgetRange: string | null;
  nilAcknowledgement: string;
  campaignTypes: string[];
  approvalContact: string | null;
}

const text = (value: unknown) => String(value ?? "").trim();
const list = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export function buildBrandVerificationEvidence(data: Record<string, unknown>): BrandVerificationEvidence {
  const evidence = {
    organizationName: text(data.organization_name),
    partnerTitle: text(data.title) || null,
    brandCategory: text(data.brand_category) || null,
    partnershipGoals: list(data.partnership_goals),
    targetAudience: list(data.target_audience),
    monthlyBudgetRange: text(data.monthly_budget_range) || null,
    nilAcknowledgement: text(data.nil_acknowledgement),
    campaignTypes: list(data.campaign_types),
    approvalContact: text(data.approval_contact) || null,
  };
  if (!evidence.organizationName || !evidence.nilAcknowledgement) {
    throw new Error("Brand Partner verification requires organization identity and NIL/compliance acknowledgement.");
  }
  return evidence;
}

export function brandAuthorityReady(input: { verificationStatus: BrandVerificationStatus; hasApprovedCampaignScope: boolean; hasApprovedComplianceScope: boolean }) {
  return input.verificationStatus === "approved" && input.hasApprovedCampaignScope && input.hasApprovedComplianceScope;
}

export type CampaignStatus =
  | "draft"
  | "review"
  | "approved"
  | "active"
  | "completed"
  | "declined";

export function buildBrandPartner(input: {
  id: string;
  name: string;
  category: "athletics" | "apparel" | "education" | "career" | "wellness" | "financial_literacy";
}) {
  return {
    ...input,
    active: true,
  };
}

export function buildNILStoreCampaign(input: {
  id: string;
  partnerId: string;
  storeProductId: string;
  athleteId: string;
  dealId?: string;
  deliverables: string[];
}) {
  return {
    ...input,
    dealId: input.dealId || null,
    status: "review" as CampaignStatus,
    disclosureRequired: true,
    createdAt: new Date().toISOString(),
  };
}

export function evaluateCampaignReadiness(input: {
  status: CampaignStatus;
  deliverables: string[];
  disclosureApproved: boolean;
  athleteApproved: boolean;
}) {
  const blockers: string[] = [];

  if (!input.athleteApproved) blockers.push("Athlete approval required.");
  if (!input.disclosureApproved) blockers.push("Disclosure approval required.");
  if (!input.deliverables.length) blockers.push("Campaign deliverables required.");
  if (!["approved", "active"].includes(input.status)) blockers.push("Campaign must be approved or active.");

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

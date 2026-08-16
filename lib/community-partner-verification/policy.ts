export type CommunityPartnerEvidence = {
  organizationName: string;
  organizationType: string;
  officialEmail: string;
  organizationWebsite: string | null;
  communityServices: string[];
  serviceArea: string;
};

const text = (value: unknown) => String(value ?? "").trim();
const list = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export function buildCommunityPartnerEvidence(data: Record<string, unknown>): CommunityPartnerEvidence {
  const evidence = {
    organizationName: text(data.organization_name),
    organizationType: text(data.organization_type),
    officialEmail: text(data.official_email),
    organizationWebsite: text(data.organization_website) || null,
    communityServices: list(data.community_services),
    serviceArea: text(data.service_area),
  };

  if (!evidence.organizationName || !evidence.organizationType || !evidence.officialEmail || !evidence.serviceArea) {
    throw new Error("Community Partner verification requires organization name, organization type, official email, and service area.");
  }
  return evidence;
}

export function communityPartnerAuthorityReady(input: {
  identityApproved: boolean;
  serviceScopeApproved: boolean;
  scholarRelationshipApproved?: boolean;
}) {
  return input.identityApproved && input.serviceScopeApproved && Boolean(input.scholarRelationshipApproved);
}

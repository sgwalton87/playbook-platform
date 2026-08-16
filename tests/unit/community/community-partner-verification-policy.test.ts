import { describe, expect, it } from "vitest";
import { buildCommunityPartnerEvidence, communityPartnerAuthorityReady } from "@/lib/community-partner-verification/policy";

describe("Community Partner verification policy", () => {
  it("requires organization identity and service-area evidence", () => {
    expect(() => buildCommunityPartnerEvidence({ organization_name: "Oakland Youth Arts" })).toThrow();
    expect(buildCommunityPartnerEvidence({
      organization_name: "Oakland Youth Arts",
      organization_type: "Arts organization",
      official_email: "team@oaklandyoutharts.org",
      service_area: "Oakland, CA",
      community_services: ["Arts and media", "Mentoring"],
    }).communityServices).toEqual(["Arts and media", "Mentoring"]);
  });

  it("requires identity, approved service scope, and an exact Scholar relationship", () => {
    expect(communityPartnerAuthorityReady({ identityApproved: true, serviceScopeApproved: true })).toBe(false);
    expect(communityPartnerAuthorityReady({ identityApproved: true, serviceScopeApproved: false, scholarRelationshipApproved: true })).toBe(false);
    expect(communityPartnerAuthorityReady({ identityApproved: true, serviceScopeApproved: true, scholarRelationshipApproved: true })).toBe(true);
  });
});

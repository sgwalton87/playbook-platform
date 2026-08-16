"use client";

import CommunityPartnerVerificationExperience from "@/components/community/CommunityPartnerVerificationExperience";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

export default function CommunityPartnerOSPage() {
  return (
    <VerifiedRoleActivationBridge roleOS="community" verificationEndpoint="/api/community-partner-verification" requiredRelationship="community_partner">
      <CommunityPartnerVerificationExperience />
    </VerifiedRoleActivationBridge>
  );
}

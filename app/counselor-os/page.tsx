"use client";

import CounselorVerificationExperience from "@/components/counselor/CounselorVerificationExperience";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

export default function CounselorOSPage() {
  return (
    <VerifiedRoleActivationBridge roleOS="counselor" verificationEndpoint="/api/counselor-verification" requiredRelationship="counselor">
      <CounselorVerificationExperience />
    </VerifiedRoleActivationBridge>
  );
}

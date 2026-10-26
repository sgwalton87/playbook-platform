"use client";

import EducatorVerificationExperience from "@/components/educator/EducatorVerificationExperience";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

export default function EducatorOSPage() {
  return (
    <VerifiedRoleActivationBridge role="educator" roleOS="educator" verificationEndpoint="/api/educator-verification" requiredRelationship="educator">
      <EducatorVerificationExperience />
    </VerifiedRoleActivationBridge>
  );
}

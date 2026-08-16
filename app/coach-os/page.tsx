"use client";

import CoachVerificationExperience from "@/components/coach/CoachVerificationExperience";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

export default function CoachOSPage() {
  return (
    <VerifiedRoleActivationBridge roleOS="coach" verificationEndpoint="/api/coach-verification" requiredRelationship="coach">
      <CoachVerificationExperience />
    </VerifiedRoleActivationBridge>
  );
}

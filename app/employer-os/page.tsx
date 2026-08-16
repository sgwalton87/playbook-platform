"use client";

import EmployerVerificationExperience from "@/components/employer/EmployerVerificationExperience";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

export default function EmployerOSPage() {
  return (
    <VerifiedRoleActivationBridge roleOS="employer" verificationEndpoint="/api/employer-verification">
      <EmployerVerificationExperience />
    </VerifiedRoleActivationBridge>
  );
}

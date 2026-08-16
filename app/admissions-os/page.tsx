"use client";

import AdmissionsVerificationExperience from "@/components/admissions/AdmissionsVerificationExperience";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

export default function AdmissionsOSPage() {
  return (
    <VerifiedRoleActivationBridge roleOS="admissions" verificationEndpoint="/api/admissions-verification">
      <AdmissionsVerificationExperience />
    </VerifiedRoleActivationBridge>
  );
}

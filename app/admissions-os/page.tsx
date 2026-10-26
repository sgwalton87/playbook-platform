"use client";

import AdmissionsVerificationExperience from "@/components/admissions/AdmissionsVerificationExperience";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

export default function AdmissionsOSPage() {
  return (
    <VerifiedRoleActivationBridge role="college-admissions" roleOS="admissions" verificationEndpoint="/api/admissions-verification">
      <AdmissionsVerificationExperience />
    </VerifiedRoleActivationBridge>
  );
}

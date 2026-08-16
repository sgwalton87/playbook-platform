"use client";

import DistrictVerificationExperience from "@/components/district/DistrictVerificationExperience";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

export default function DistrictOSPage() {
  return (
    <VerifiedRoleActivationBridge roleOS="district" verificationEndpoint="/api/district-verification">
      <DistrictVerificationExperience />
    </VerifiedRoleActivationBridge>
  );
}

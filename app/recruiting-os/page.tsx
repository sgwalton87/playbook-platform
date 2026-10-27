"use client";

import RecruitingVerificationExperience from "@/components/recruiting/RecruitingVerificationExperience";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

export default function RecruitingOSPage() {
  return (
    <VerifiedRoleActivationBridge role="college-coach" roleOS="recruiter" verificationEndpoint="/api/recruiting-verification">
      <RecruitingVerificationExperience />
    </VerifiedRoleActivationBridge>
  );
}

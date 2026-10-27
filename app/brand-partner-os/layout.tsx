"use client";

import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";

// The Brand Partner page enforces its own canonical role identity and onboarding
// boundary. Verification status is displayed inside the workspace; it must not
// replace the dashboard. Backend endpoints and RLS continue to enforce scoped
// organization, campaign, NIL, and applicant permissions independently.
export default function BrandPartnerOSLayout({ children }: { children: React.ReactNode }) {
  return <BrandPartnerVerificationGate>{children}</BrandPartnerVerificationGate>;
}

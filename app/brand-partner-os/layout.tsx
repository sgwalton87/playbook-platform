"use client";

import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import CanonicalRoleIdentityBoundary from "@/components/role-os/CanonicalRoleIdentityBoundary";

// Verify identity, durable role and completed onboarding for every nested route.
// Independent Brand Partner approval controls individual capabilities, not
// whether an authenticated Brand Partner may see their dashboard.
export default function BrandPartnerOSLayout({ children }: { children: React.ReactNode }) {
  return <CanonicalRoleIdentityBoundary role="brand-partner">
    <BrandPartnerVerificationGate>{children}</BrandPartnerVerificationGate>
  </CanonicalRoleIdentityBoundary>;
}

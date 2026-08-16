"use client";

import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import { CanonicalRoleAuthorityGate } from "@/components/role-os/RoleAuthorityGate";

export default function BrandPartnerOSLayout({ children }: { children: React.ReactNode }) {
  return (
    <CanonicalRoleAuthorityGate role="brand-partner">
      <BrandPartnerVerificationGate>{children}</BrandPartnerVerificationGate>
    </CanonicalRoleAuthorityGate>
  );
}

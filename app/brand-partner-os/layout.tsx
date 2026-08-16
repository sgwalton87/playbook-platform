"use client";

import { CanonicalRoleAuthorityGate } from "@/components/role-os/RoleAuthorityGate";

export default function BrandPartnerOSLayout({ children }: { children: React.ReactNode }) {
  return (
    <CanonicalRoleAuthorityGate role="brand-partner">
      {children}
    </CanonicalRoleAuthorityGate>
  );
}

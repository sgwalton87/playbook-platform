"use client";

import { CanonicalRoleAuthorityGate } from "@/components/role-os/RoleAuthorityGate";

export default function AthleteAbroadOSLayout({ children }: { children: React.ReactNode }) {
  return (
    <CanonicalRoleAuthorityGate role="athlete-abroad">
      {children}
    </CanonicalRoleAuthorityGate>
  );
}

"use client";

import CanonicalRoleIdentityBoundary from "@/components/role-os/CanonicalRoleIdentityBoundary";
import AthleteAbroadReadinessGate from "@/components/athlete-abroad/AthleteAbroadReadinessGate";

export default function AthleteAbroadOSLayout({ children }: { children: React.ReactNode }) {
  return <CanonicalRoleIdentityBoundary role="athlete-abroad">
    <AthleteAbroadReadinessGate>{children}</AthleteAbroadReadinessGate>
  </CanonicalRoleIdentityBoundary>;
}

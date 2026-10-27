"use client";

import { useEffect, useState } from "react";
import CanonicalRoleIdentityBoundary from "@/components/role-os/CanonicalRoleIdentityBoundary";
import type { PlaybookRole } from "@/lib/roles/registry";
import RoleDashboardExperience from "@/components/role-os/dashboards/RoleDashboardExperience";
import type { PlaybookRoleOS } from "@/lib/role-os";
import { supabase } from "@/lib/supabaseClient";

type VerificationEnvelope = {
  request?: { status?: string } | null;
};

type ActivationBridgeProps = {
  role: PlaybookRole;
  roleOS: PlaybookRoleOS;
  verificationEndpoint: string;
  requiredRelationship?: string;
  children: React.ReactNode;
};

export default function VerifiedRoleActivationBridge({ role, ...props }: ActivationBridgeProps) {
  return <CanonicalRoleIdentityBoundary role={role}>
    <VerifiedRoleActivationContent {...props} />
  </CanonicalRoleIdentityBoundary>;
}

function VerifiedRoleActivationContent({
  roleOS, verificationEndpoint, requiredRelationship, children,
}: Omit<ActivationBridgeProps, "role">) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await fetch(verificationEndpoint, { cache: "no-store" });
      if (!response.ok) return;

      const envelope = await response.json() as VerificationEnvelope;
      if (envelope.request?.status !== "approved") return;

      if (!requiredRelationship) {
        if (!cancelled) setActive(true);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const relationship = await supabase
        .from("support_relationships")
        .select("id")
        .eq("supporter_id", userData.user.id)
        .eq("relationship", requiredRelationship)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (!cancelled && !relationship.error && relationship.data) {
        setActive(true);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [requiredRelationship, verificationEndpoint]);

  if (active) {
    return <RoleDashboardExperience role={roleOS} authorityVerified />;
  }

  return <>{children}</>;
}

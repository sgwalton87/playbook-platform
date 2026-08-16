"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCanonicalOnboardingRoute,
  getRoleOnboardingCompletionContract,
} from "@/lib/onboarding";
import type { PlaybookRoleOS } from "@/lib/role-os";
import {
  PLAYBOOK_ROLES,
  getRoleDestination,
  requirePlaybookRole,
  type PlaybookRole,
} from "@/lib/roles/registry";
import { supabase } from "@/lib/supabaseClient";

const OS_TO_ROLE: Record<PlaybookRoleOS, PlaybookRole> = {
  learner: "scholar",
  family: "family",
  educator: "educator",
  counselor: "high-school-counselor",
  coach: "coach",
  district: "district",
  university: "college-admissions",
  recruiter: "college-coach",
  admissions: "college-admissions",
  employer: "employer",
  mentor: "mentor",
  "transition-youth": "transition-youth",
  community: "other",
};

type GateState = "loading" | "active" | "pending" | "rejected" | "error";

export default function RoleAuthorityGate({
  roleOS,
  children,
}: {
  roleOS: PlaybookRoleOS;
  children: React.ReactNode;
}) {
  return (
    <CanonicalRoleAuthorityGate role={OS_TO_ROLE[roleOS]}>
      {children}
    </CanonicalRoleAuthorityGate>
  );
}

export function CanonicalRoleAuthorityGate({
  role,
  children,
}: {
  role: PlaybookRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const contract = useMemo(() => getRoleOnboardingCompletionContract(role), [role]);
  const [state, setState] = useState<GateState>("loading");
  const [relationshipReady, setRelationshipReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const profile = await supabase
        .from("profiles")
        .select("role,profile_mode,onboarding_completed,verification_status")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      if (profile.error || !profile.data) {
        setMessage(profile.error?.message ?? "Playbook could not load this role profile.");
        setState("error");
        return;
      }

      let durableRole: PlaybookRole;
      try {
        durableRole = requirePlaybookRole(profile.data.profile_mode ?? profile.data.role);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "The durable Playbook role is invalid.");
        setState("error");
        return;
      }

      if (durableRole !== role) {
        router.replace(getRoleDestination(durableRole));
        return;
      }

      if (!profile.data.onboarding_completed) {
        router.replace(getCanonicalOnboardingRoute(role));
        return;
      }

      if (profile.data.verification_status === "rejected") {
        setState("rejected");
        return;
      }

      if (contract.state === "implemented") {
        setState("active");
        return;
      }

      if (role === "family") {
        const relationship = await supabase
          .from("support_relationships")
          .select("id")
          .eq("supporter_id", user.id)
          .eq("relationship", "parent_guardian")
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        if (!active) return;
        if (relationship.error) {
          setMessage(relationship.error.message);
          setState("error");
          return;
        }
        setRelationshipReady(Boolean(relationship.data));
      }

      setState("pending");
    }

    void load();
    return () => {
      active = false;
    };
  }, [contract.state, role, router]);

  if (state === "active") return <>{children}</>;

  if (state === "loading") {
    return <RoleGateSurface role={role} title={`Preparing ${PLAYBOOK_ROLES[role].osLabel}…`} body="Checking your role, onboarding, and authority contract." />;
  }

  if (state === "rejected") {
    return <RoleGateSurface role={role} title="Verification was not approved" body={`Your ${PLAYBOOK_ROLES[role].label} profile remains restricted. No role authority has been activated.`} />;
  }

  if (state === "error") {
    return <RoleGateSurface role={role} title="Authority cannot be proven" body="This Operating System is fail-closed because Playbook could not verify the required role evidence." message={message} />;
  }

  const familyDetail = role === "family"
    ? relationshipReady
      ? "Your Parent / Guardian relationship is active. The independent Family PBOS adapter and exact-head acceptance are still required before the full dashboard is certified."
      : "A Scholar-originated Parent / Guardian invitation must be accepted before Family access can activate."
    : null;

  return (
    <RoleGateSurface
      role={role}
      title={`${PLAYBOOK_ROLES[role].osLabel} is awaiting authority`}
      body={familyDetail ?? contract.requirement}
      message={`Your ${PLAYBOOK_ROLES[role].label} onboarding profile is complete. You are in the correct Operating System, but restricted capabilities remain locked until the independent ${contract.adapter} contract is certified.`}
    />
  );
}

function RoleGateSurface({
  role,
  title,
  body,
  message,
}: {
  role: PlaybookRole;
  title: string;
  body: string;
  message?: string | null;
}) {
  return (
    <main
      data-visual-canon="PGDS-001"
      data-testid={`${role}-os-authority-gate`}
      style={page}
    >
      <section style={card}>
        <p style={eyebrow}>{PLAYBOOK_ROLES[role].osLabel} · Independent role pathway</p>
        <h1 style={titleStyle}>{title}</h1>
        <p style={bodyStyle}>{body}</p>
        {message && <div style={notice}>{message}</div>}
        <div style={routeBadge}>
          Canonical destination: <strong>{PLAYBOOK_ROLES[role].osRoute}</strong>
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: "radial-gradient(circle at 80% 12%,rgba(249,115,22,.18),transparent 28%),linear-gradient(135deg,#06172D,#081D38 56%,#031023)",
  color: "#FFFFFF",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 760,
  padding: "clamp(28px,5vw,52px)",
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,.16)",
  background: "rgba(4,18,39,.94)",
  boxShadow: "0 30px 90px rgba(0,0,0,.28)",
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#FF9A6C",
};

const titleStyle: React.CSSProperties = {
  margin: "12px 0",
  fontSize: "clamp(34px,6vw,64px)",
  lineHeight: 1,
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#C7D5E5",
  fontSize: 17,
  lineHeight: 1.65,
};

const notice: React.CSSProperties = {
  marginTop: 20,
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(255,154,108,.35)",
  background: "rgba(249,115,22,.12)",
  color: "#FFE7D6",
  lineHeight: 1.6,
};

const routeBadge: React.CSSProperties = {
  marginTop: 18,
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,.08)",
  color: "#C7D5E5",
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
};

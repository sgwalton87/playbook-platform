"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardExperience from "@/components/role-os/dashboards/RoleDashboardExperience";
import { getCanonicalOnboardingRoute } from "@/lib/onboarding";
import { getRoleDestination, normalizePlaybookRole } from "@/lib/roles/registry";
import { supabase } from "@/lib/supabaseClient";

type MentorAccessState =
  | "loading"
  | "active"
  | "invitation-required"
  | "pending-validation"
  | "unavailable";

type MentorValidationRequest = {
  id: string;
  status: "pending" | "approved" | "rejected";
  scholar_id: string;
  created_at: string;
};

type MentorValidationApproval = {
  approver_user_id: string;
  relationship_snapshot: string;
};

export default function MentorValidationExperience() {
  const router = useRouter();
  const [accessState, setAccessState] = useState<MentorAccessState>("loading");
  const [request, setRequest] = useState<MentorValidationRequest | null>(null);
  const [approvals, setApprovals] = useState<MentorValidationApproval[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  const distinctApprovalCount = useMemo(
    () => new Set(approvals.map((approval) => approval.approver_user_id)).size,
    [approvals]
  );
  const privilegedApproval = useMemo(
    () => approvals.some((approval) => ["parent_guardian", "coach"].includes(approval.relationship_snapshot)),
    [approvals]
  );
  const thresholdMet = privilegedApproval || distinctApprovalCount >= 2;

  const load = useCallback(async () => {
    setAccessState("loading");
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const profile = await supabase
      .from("profiles")
      .select("onboarding_completed,profile_mode,role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile.error || !profile.data) {
      setMessage(profile.error?.message ?? "Playbook could not load your Mentor profile.");
      setAccessState("unavailable");
      return;
    }

    const durableRole = normalizePlaybookRole(profile.data.profile_mode ?? profile.data.role);
    if (durableRole !== "mentor") {
      router.replace(getRoleDestination(durableRole));
      return;
    }

    if (!profile.data.onboarding_completed) {
      router.replace(getCanonicalOnboardingRoute("mentor"));
      return;
    }

    const relationship = await supabase
      .from("support_relationships")
      .select("id")
      .eq("supporter_id", user.id)
      .eq("relationship", "mentor")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (relationship.error) {
      setMessage(relationship.error.message);
      setAccessState("unavailable");
      return;
    }

    if (relationship.data) {
      setAccessState("active");
      return;
    }

    const validationRequest = await supabase
      .from("mentor_validation_requests")
      .select("id,status,scholar_id,created_at")
      .eq("mentor_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<MentorValidationRequest>();

    if (validationRequest.error) {
      setMessage(validationRequest.error.message);
      setAccessState("unavailable");
      return;
    }

    if (!validationRequest.data) {
      setRequest(null);
      setApprovals([]);
      setAccessState("invitation-required");
      return;
    }

    const approvalResult = await supabase
      .from("mentor_validation_approvals")
      .select("approver_user_id,relationship_snapshot")
      .eq("request_id", validationRequest.data.id);

    if (approvalResult.error) {
      setMessage(approvalResult.error.message);
      setAccessState("unavailable");
      return;
    }

    setRequest(validationRequest.data);
    setApprovals((approvalResult.data ?? []) as MentorValidationApproval[]);
    setAccessState("pending-validation");
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function finalizeValidation() {
    if (!request?.id || !thresholdMet) return;

    setFinalizing(true);
    setMessage(null);
    try {
      const response = await fetch("/api/mentor-validation/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validationRequestId: request.id }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "Mentor access could not be activated.");
        return;
      }
      await load();
    } catch {
      setMessage("Mentor access could not be activated.");
    } finally {
      setFinalizing(false);
    }
  }

  if (accessState === "active") {
    return <RoleDashboardExperience role="mentor" />;
  }

  if (accessState === "loading") {
    return <MentorGate title="Preparing Mentor OS…" body="Checking your invitation, onboarding, and validation status." />;
  }

  if (accessState === "unavailable") {
    return (
      <MentorGate
        title="Mentor access is fail-closed"
        body="Playbook could not prove the required Mentor authority. No Scholar access has been granted."
        message={message}
        actionLabel="Check again"
        onAction={() => void load()}
      />
    );
  }

  if (accessState === "invitation-required") {
    return (
      <MentorGate
        testId="mentor-invitation-required"
        title="A Scholar invitation is required"
        body="Mentors cannot self-connect to a Scholar. Ask the Scholar you support to invite this account from their Playbook support network. After you accept, the validation process will begin here in Mentor OS."
        actionLabel="Check for invitation"
        onAction={() => void load()}
      />
    );
  }

  return (
    <MentorGate
      testId="mentor-validation-pending"
      title="Mentor validation is in progress"
      body="Your Scholar invitation was accepted, but Mentor access remains locked until the Scholar's support system validates the relationship."
      message={message}
    >
      <div style={ruleCard}>
        <p style={eyebrow}>Validation rule</p>
        <p style={ruleText}>
          Approval by <strong>one active Parent / Guardian</strong>, <strong>one active Coach</strong>, or <strong>two distinct active support-system members</strong>.
        </p>
      </div>

      <div style={metrics}>
        <Metric label="Distinct approvals" value={String(distinctApprovalCount)} />
        <Metric label="Parent / Coach approval" value={privilegedApproval ? "Yes" : "No"} />
        <Metric label="Threshold" value={thresholdMet ? "Met" : "Waiting"} />
      </div>

      <div style={actions}>
        <button type="button" onClick={() => void load()} style={secondaryButton}>
          Refresh status
        </button>
        <button
          type="button"
          onClick={() => void finalizeValidation()}
          disabled={!thresholdMet || finalizing}
          style={{ ...primaryButton, opacity: !thresholdMet || finalizing ? 0.55 : 1 }}
        >
          {finalizing ? "Activating…" : "Activate Mentor access"}
        </button>
      </div>
    </MentorGate>
  );
}

function MentorGate({
  title,
  body,
  message,
  actionLabel,
  onAction,
  children,
  testId,
}: {
  title: string;
  body: string;
  message?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
  testId?: string;
}) {
  return (
    <main data-visual-canon="PGDS-001" data-testid={testId} style={page}>
      <section style={card}>
        <p style={eyebrow}>Mentor OS · Governed access</p>
        <h1 style={titleStyle}>{title}</h1>
        <p style={bodyStyle}>{body}</p>
        {message && <div role="alert" style={alertStyle}>{message}</div>}
        {children}
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} style={primaryButton}>{actionLabel}</button>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={metricCard}>
      <strong style={metricValue}>{value}</strong>
      <span style={metricLabel}>{label}</span>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: "radial-gradient(circle at 80% 10%,rgba(249,115,22,.2),transparent 28%),linear-gradient(135deg,#06172D,#081D38 56%,#031023)",
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
  margin: "0 0 24px",
  color: "#C7D5E5",
  fontSize: 17,
  lineHeight: 1.65,
};

const ruleCard: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.12)",
};

const ruleText: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#F8FAFC",
  lineHeight: 1.6,
};

const metrics: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: 12,
  margin: "18px 0",
};

const metricCard: React.CSSProperties = {
  display: "grid",
  gap: 6,
  padding: 16,
  borderRadius: 16,
  background: "#FFFFFF",
  color: "#0F172A",
};

const metricValue: React.CSSProperties = { fontSize: 24 };
const metricLabel: React.CSSProperties = { color: "#64748B", fontSize: 12, fontWeight: 800 };

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "13px 18px",
  background: "#F97316",
  color: "#FFFFFF",
  fontWeight: 950,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  ...primaryButton,
  background: "transparent",
  border: "1px solid rgba(255,255,255,.24)",
};

const alertStyle: React.CSSProperties = {
  marginBottom: 18,
  padding: 14,
  borderRadius: 14,
  background: "#7F1D1D",
  color: "#FEE2E2",
};

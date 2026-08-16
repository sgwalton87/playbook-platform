"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ActiveSupportRelationship = {
  id: string;
  scholar_id: string;
  relationship: string;
};

type MentorValidationRequest = {
  id: string;
  scholar_id: string;
  mentor_user_id: string;
  mentor_name: string | null;
  mentor_email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type MentorValidationApproval = {
  request_id: string;
  approver_user_id: string;
  relationship_snapshot: string;
};

type QueueState = "loading" | "ready" | "unavailable";

export default function MentorValidationQueue({ showEmpty = false }: { showEmpty?: boolean }) {
  const [state, setState] = useState<QueueState>("loading");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [relationships, setRelationships] = useState<ActiveSupportRelationship[]>([]);
  const [requests, setRequests] = useState<MentorValidationRequest[]>([]);
  const [approvals, setApprovals] = useState<MentorValidationApproval[]>([]);
  const [scholarNames, setScholarNames] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setState("unavailable");
      setMessage("Sign in is required to review Mentor validations.");
      return;
    }

    setCurrentUserId(user.id);

    const relationshipResult = await supabase
      .from("support_relationships")
      .select("id,scholar_id,relationship")
      .eq("supporter_id", user.id)
      .eq("status", "active");

    if (relationshipResult.error) {
      setState("unavailable");
      setMessage(relationshipResult.error.message);
      return;
    }

    const activeRelationships = (relationshipResult.data ?? []) as ActiveSupportRelationship[];
    setRelationships(activeRelationships);
    const scholarIds = Array.from(new Set(activeRelationships.map((relationship) => relationship.scholar_id)));

    if (scholarIds.length === 0) {
      setRequests([]);
      setApprovals([]);
      setScholarNames({});
      setState("ready");
      return;
    }

    const requestResult = await supabase
      .from("mentor_validation_requests")
      .select("id,scholar_id,mentor_user_id,mentor_name,mentor_email,status,created_at")
      .in("scholar_id", scholarIds)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (requestResult.error) {
      setState("unavailable");
      setMessage(requestResult.error.message);
      return;
    }

    const pendingRequests = (requestResult.data ?? []) as MentorValidationRequest[];
    setRequests(pendingRequests);

    const [approvalResult, scholarResult] = await Promise.all([
      pendingRequests.length
        ? supabase
            .from("mentor_validation_approvals")
            .select("request_id,approver_user_id,relationship_snapshot")
            .in("request_id", pendingRequests.map((request) => request.id))
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("profiles")
        .select("id,full_name")
        .in("id", scholarIds),
    ]);

    if (approvalResult.error) {
      setState("unavailable");
      setMessage(approvalResult.error.message);
      return;
    }

    setApprovals((approvalResult.data ?? []) as MentorValidationApproval[]);
    const nextScholarNames: Record<string, string> = {};
    if (!scholarResult.error) {
      for (const profile of scholarResult.data ?? []) {
        nextScholarNames[profile.id] = profile.full_name || "Scholar";
      }
    }
    setScholarNames(nextScholarNames);
    setMessage(null);
    setState("ready");
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const relationshipByScholar = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const relationship of relationships) {
      const current = map.get(relationship.scholar_id) ?? [];
      current.push(relationship.relationship);
      map.set(relationship.scholar_id, current);
    }
    return map;
  }, [relationships]);

  async function approve(requestId: string) {
    setApprovingId(requestId);
    setMessage(null);
    try {
      const response = await fetch("/api/mentor-validation/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validationRequestId: requestId }),
      });
      const result = (await response.json()) as {
        error?: string;
        validation?: { approvalCount?: number; thresholdMet?: boolean };
      };
      if (!response.ok) {
        setMessage(result.error ?? "Mentor validation approval could not be recorded.");
        return;
      }
      setMessage(
        result.validation?.thresholdMet
          ? "Approval recorded. The Mentor validation threshold is now satisfied."
          : `Approval recorded. ${result.validation?.approvalCount ?? 0} distinct approval(s) are currently recorded.`
      );
      await load();
    } catch {
      setMessage("Mentor validation approval could not be recorded.");
    } finally {
      setApprovingId(null);
    }
  }

  if (state === "loading") {
    return <section style={panel}>Loading Mentor validation requests…</section>;
  }

  if (state === "unavailable") {
    return (
      <section style={panel}>
        <p style={eyebrow}>Mentor validation</p>
        <h2 style={heading}>Approval tools are fail-closed</h2>
        <p style={copy}>Playbook could not prove your active support-system authority.</p>
        {message && <div role="alert" style={alert}>{message}</div>}
      </section>
    );
  }

  if (requests.length === 0 && !showEmpty) return null;

  return (
    <section data-testid="mentor-validation-queue" style={panel}>
      <p style={eyebrow}>Support-system responsibility</p>
      <h2 style={heading}>Mentor validation requests</h2>
      <p style={copy}>
        Approve only a Mentor you know is appropriate for this Scholar. One active Parent / Guardian or Coach approval satisfies the threshold; otherwise two distinct active support members must approve.
      </p>

      {message && <div role="status" aria-live="polite" style={notice}>{message}</div>}

      {requests.length === 0 ? (
        <div style={empty}>No pending Mentor validation requests are assigned to your active support relationships.</div>
      ) : (
        <div style={list}>
          {requests.map((request) => {
            const requestApprovals = approvals.filter((approval) => approval.request_id === request.id);
            const distinctCount = new Set(requestApprovals.map((approval) => approval.approver_user_id)).size;
            const privilegedApproval = requestApprovals.some((approval) =>
              ["parent_guardian", "coach"].includes(approval.relationship_snapshot)
            );
            const thresholdMet = privilegedApproval || distinctCount >= 2;
            const alreadyApproved = requestApprovals.some(
              (approval) => approval.approver_user_id === currentUserId
            );
            const viewerRelationships = relationshipByScholar.get(request.scholar_id) ?? [];

            return (
              <article key={request.id} style={requestCard}>
                <div>
                  <p style={requestMeta}>
                    {scholarNames[request.scholar_id] ?? "Scholar"} · Your active role: {viewerRelationships.join(", ") || "support member"}
                  </p>
                  <h3 style={requestTitle}>{request.mentor_name || request.mentor_email}</h3>
                  <p style={requestCopy}>Requested Mentor relationship · {new Date(request.created_at).toLocaleDateString()}</p>
                </div>

                <div style={metrics}>
                  <QueueMetric label="Distinct approvals" value={String(distinctCount)} />
                  <QueueMetric label="Parent / Coach" value={privilegedApproval ? "Yes" : "No"} />
                  <QueueMetric label="Threshold" value={thresholdMet ? "Met" : "Waiting"} />
                </div>

                <button
                  type="button"
                  onClick={() => void approve(request.id)}
                  disabled={alreadyApproved || approvingId === request.id}
                  style={{ ...button, opacity: alreadyApproved || approvingId === request.id ? 0.55 : 1 }}
                >
                  {alreadyApproved
                    ? "You approved"
                    : approvingId === request.id
                      ? "Recording approval…"
                      : "Approve Mentor"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function QueueMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={metric}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

const panel: React.CSSProperties = {
  marginTop: 22,
  padding: 20,
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(255,255,255,.06)",
  color: "#FFFFFF",
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontFamily: "'Space Mono', monospace",
  color: "#FF9A6C",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

const heading: React.CSSProperties = { margin: "8px 0", fontSize: 26 };
const copy: React.CSSProperties = { margin: 0, color: "#C7D5E5", lineHeight: 1.6 };
const list: React.CSSProperties = { display: "grid", gap: 14, marginTop: 18 };
const requestCard: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "#FFFFFF",
  color: "#0F172A",
};
const requestMeta: React.CSSProperties = { margin: 0, color: "#F97316", fontSize: 11, fontWeight: 900 };
const requestTitle: React.CSSProperties = { margin: "7px 0 3px", fontSize: 22 };
const requestCopy: React.CSSProperties = { margin: 0, color: "#64748B" };
const metrics: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: 8,
  margin: "14px 0",
};
const metric: React.CSSProperties = {
  display: "grid",
  gap: 3,
  padding: 10,
  borderRadius: 12,
  background: "#F1F5F9",
  fontSize: 12,
};
const button: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "11px 16px",
  background: "#F97316",
  color: "#FFFFFF",
  fontWeight: 900,
  cursor: "pointer",
};
const empty: React.CSSProperties = {
  marginTop: 16,
  padding: 16,
  borderRadius: 14,
  background: "rgba(255,255,255,.06)",
  color: "#C7D5E5",
};
const notice: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "rgba(34,197,94,.12)",
  color: "#DCFCE7",
};
const alert: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "#7F1D1D",
  color: "#FEE2E2",
};

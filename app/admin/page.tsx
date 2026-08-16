"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

type ReviewRequest = {
  request_type: string;
  request_id: string;
  subject_user_id: string;
  status: "pending" | "under_review";
  submitted_at: string;
  evidence: Record<string, unknown>;
};

const LABELS: Record<string, string> = {
  coach: "High School Coach",
  educator: "Educator",
  counselor: "High School Counselor",
  district: "District / School Administrator",
  recruiting: "College Coach / Recruiter",
  admissions: "College Admissions",
  employer: "Employer",
  "brand-partner": "Brand Partner",
  "community-partner": "Community Partner",
  "athlete-abroad": "Athlete Abroad",
};

function readable(key: string) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (value && typeof value === "object") return JSON.stringify(value);
  if (value === true) return "Yes";
  if (value === false) return "No";
  return String(value ?? "—");
}

export default function AdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace("/login?next=/admin");
      return;
    }

    const response = await fetch("/api/admin/verification", { cache: "no-store" });
    if (response.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error || "Unable to load verification queue.");
      setLoading(false);
      return;
    }

    const body = await response.json();
    setRequests(body.requests || []);
    setForbidden(false);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((request) => request.status === "pending").length,
    reviewing: requests.filter((request) => request.status === "under_review").length,
    roles: new Set(requests.map((request) => request.request_type)).size,
  }), [requests]);

  async function review(request: ReviewRequest, decision: "under_review" | "approved" | "rejected") {
    setBusyId(request.request_id);
    setError("");

    const response = await fetch("/api/admin/verification", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        requestType: request.request_type,
        requestId: request.request_id,
        decision,
        notes: notes[request.request_id] || null,
      }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.error || "Unable to update verification review.");
      setBusyId("");
      return;
    }

    setNotes((current) => ({ ...current, [request.request_id]: "" }));
    await load();
    setBusyId("");
  }

  if (forbidden) {
    return (
      <PlaybookPage>
        <PlaybookHero eyebrow="Governed access" title="Verification Review Center" subtitle="This workspace is restricted to Playbook Founder/Admin verification reviewers." />
        <PlaybookGrid>
          <PlaybookCard eyebrow="Default deny" title="Reviewer authority required">
            <p style={copy}>Verification evidence is not available through a general admin directory. Access is enforced by the database reviewer authority.</p>
          </PlaybookCard>
        </PlaybookGrid>
      </PlaybookPage>
    );
  }

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Platform governance"
        title="Verification Review Center"
        subtitle="Review role evidence without bypassing Scholar ownership, relationship consent, or downstream scope gates."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Open reviews" value={loading ? "…" : String(counts.total)} />
        <PlaybookMetric label="Pending" value={loading ? "…" : String(counts.pending)} />
        <PlaybookMetric label="Under review" value={loading ? "…" : String(counts.reviewing)} />
        <PlaybookMetric label="Role types" value={loading ? "…" : String(counts.roles)} />
      </PlaybookMetrics>

      {error ? <div style={errorBox} role="alert">{error}</div> : null}

      {loading ? (
        <section style={stateCard}>Loading governed verification queue…</section>
      ) : requests.length === 0 ? (
        <section style={stateCard}>
          <PlaybookPill>All clear</PlaybookPill>
          <h2 style={stateTitle}>No role verification requests need review.</h2>
          <p style={copy}>New evidence will appear here only after a user completes the correct role onboarding and submits the role-specific verification request.</p>
        </section>
      ) : (
        <PlaybookGrid min={340}>
          {requests.map((request) => (
            <PlaybookCard
              key={`${request.request_type}-${request.request_id}`}
              eyebrow={LABELS[request.request_type] || request.request_type}
              title={request.status === "under_review" ? "Review in progress" : "Evidence ready for review"}
            >
              <div style={metaRow}>
                <PlaybookPill>{request.status.replace("_", " ")}</PlaybookPill>
                <span style={dateText}>{new Date(request.submitted_at).toLocaleString()}</span>
              </div>

              <div style={evidenceGrid}>
                {Object.entries(request.evidence || {}).map(([key, value]) => (
                  <div key={key} style={evidenceRow}>
                    <span style={evidenceLabel}>{readable(key)}</span>
                    <strong style={evidenceValue}>{displayValue(value)}</strong>
                  </div>
                ))}
              </div>

              <label style={notesLabel}>
                Review notes
                <textarea
                  value={notes[request.request_id] || ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [request.request_id]: event.target.value }))}
                  placeholder="Record evidence considered, follow-up needed, or reason for the decision."
                  rows={3}
                  maxLength={4000}
                  style={notesInput}
                />
              </label>

              <div style={actions}>
                <button type="button" disabled={busyId === request.request_id} onClick={() => void review(request, "under_review")} style={secondaryButton}>Mark reviewing</button>
                <button type="button" disabled={busyId === request.request_id} onClick={() => void review(request, "rejected")} style={dangerButton}>Reject</button>
                <button type="button" disabled={busyId === request.request_id} onClick={() => void review(request, "approved")} style={primaryButton}>Approve</button>
              </div>
            </PlaybookCard>
          ))}
        </PlaybookGrid>
      )}
    </PlaybookPage>
  );
}

const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.65 };
const stateCard: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", background: "#fff", border: "1px solid #E2E8F0", borderRadius: "24px 6px 24px 6px", padding: 28 };
const stateTitle: React.CSSProperties = { color: "#0F172A", fontSize: 30, margin: "16px 0 8px" };
const errorBox: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", fontWeight: 800 };
const metaRow: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 };
const dateText: React.CSSProperties = { color: "#94A3B8", fontSize: 12, fontWeight: 700 };
const evidenceGrid: React.CSSProperties = { display: "grid", gap: 8, marginBottom: 18 };
const evidenceRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(120px,.8fr) 1.2fr", gap: 12, paddingBottom: 8, borderBottom: "1px solid #E2E8F0" };
const evidenceLabel: React.CSSProperties = { color: "#64748B", fontSize: 12, fontWeight: 800 };
const evidenceValue: React.CSSProperties = { color: "#0F172A", fontSize: 12, overflowWrap: "anywhere" };
const notesLabel: React.CSSProperties = { display: "grid", gap: 7, color: "#334155", fontSize: 12, fontWeight: 900 };
const notesInput: React.CSSProperties = { width: "100%", boxSizing: "border-box", resize: "vertical", border: "1px solid #CBD5E1", borderRadius: 10, padding: 12, font: "inherit", color: "#0F172A", background: "#F8FAFC" };
const actions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 };
const baseButton: React.CSSProperties = { border: 0, borderRadius: 9, padding: "11px 14px", fontWeight: 950, cursor: "pointer" };
const primaryButton: React.CSSProperties = { ...baseButton, background: "#F97316", color: "#fff" };
const secondaryButton: React.CSSProperties = { ...baseButton, background: "#E2E8F0", color: "#0F172A" };
const dangerButton: React.CSSProperties = { ...baseButton, background: "#FEE2E2", color: "#991B1B" };

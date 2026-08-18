"use client";

import { useEffect, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookPage, PlaybookPill } from "@/components/ui";

type ModerationReport = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  detail: string | null;
  status: string;
  created_at: string;
  target_moderation_state: string | null;
};

export default function ModerationPage() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    const res = await fetch("/api/admin/moderation");
    const json = await res.json() as { reports?: ModerationReport[]; error?: string };
    if (!res.ok) setError(json.error || "Moderation queue could not be loaded.");
    setReports(json.reports || []);
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function updateStatus(reportId: string, status: "reviewing" | "resolved" | "dismissed") {
    setBusy(reportId); setError(""); setMessage("");
    const res = await fetch("/api/admin/moderation", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    const json = await res.json() as { error?: string };
    if (!res.ok) setError(json.error || "Moderation update failed.");
    else setMessage(`Report marked ${status}.`);
    setBusy(null);
    if (res.ok) await load();
  }

  async function enforce(report: ModerationReport, action: "hide_content" | "restore_content") {
    setBusy(report.id); setError(""); setMessage("");
    const res = await fetch("/api/admin/moderation", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        reportId: report.id,
        postId: report.target_id,
        action,
        note: action === "hide_content" ? "Feed story hidden after Trust & Safety review." : "Feed story restored after Trust & Safety review.",
      }),
    });
    const json = await res.json() as { error?: string };
    if (!res.ok) setError(json.error || "Feed enforcement failed.");
    else setMessage(action === "hide_content" ? "Feed story hidden and audit record created." : "Feed story restored and audit record created.");
    setBusy(null);
    if (res.ok) await load();
  }

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Trust & Safety" title="Moderation Queue" subtitle="Review community reports, document decisions, and enforce Feed publication safety through governed human review." />
      {message && <p role="status" style={success}>{message}</p>}
      {error && <p role="alert" style={failure}>{error}</p>}

      {loading ? (
        <PlaybookCard eyebrow="Loading" title="Reviewing moderation queue"><p style={body}>Loading reports...</p></PlaybookCard>
      ) : (
        <PlaybookGrid>
          {reports.map((report) => (
            <PlaybookCard key={report.id} eyebrow={report.target_type} title={report.reason}>
              <p style={body}>{report.detail || "No additional detail provided."}</p>
              <div style={pillRow}>
                <PlaybookPill>{report.status}</PlaybookPill>
                <PlaybookPill>{new Date(report.created_at).toLocaleDateString()}</PlaybookPill>
                {report.target_type === "post" && <PlaybookPill>{`Feed: ${report.target_moderation_state || "unknown"}`}</PlaybookPill>}
              </div>
              <div style={actions}>
                <button disabled={busy === report.id} onClick={() => void updateStatus(report.id, "reviewing")} style={button}>Review</button>
                {report.target_type === "post" && report.target_moderation_state === "visible" && <button disabled={busy === report.id} onClick={() => void enforce(report, "hide_content")} style={dangerButton}>Hide story</button>}
                {report.target_type === "post" && report.target_moderation_state === "hidden" && <button disabled={busy === report.id} onClick={() => void enforce(report, "restore_content")} style={restoreButton}>Restore story</button>}
                <button disabled={busy === report.id} onClick={() => void updateStatus(report.id, "resolved")} style={button}>Resolve only</button>
                <button disabled={busy === report.id} onClick={() => void updateStatus(report.id, "dismissed")} style={secondaryButton}>Dismiss</button>
              </div>
            </PlaybookCard>
          ))}
          {!reports.length && <PlaybookCard eyebrow="Queue Clear" title="No open reports"><p style={body}>There are no reports waiting for review.</p></PlaybookCard>}
        </PlaybookGrid>
      )}
    </PlaybookPage>
  );
}

const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
const pillRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 };
const actions: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
const button: React.CSSProperties = { border: 0, borderRadius: 10, padding: "10px 12px", background: "#0F172A", color: "#F8F7F4", fontWeight: 800, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { ...button, background: "#E2E8F0", color: "#0F172A" };
const dangerButton: React.CSSProperties = { ...button, background: "#B91C1C" };
const restoreButton: React.CSSProperties = { ...button, background: "#166534" };
const success: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 14px", color: "#166534", fontWeight: 800 };
const failure: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 14px", color: "#991B1B", fontWeight: 800 };
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const REASONS = ["Safety concern", "Harassment", "Spam", "Misleading content", "Other"] as const;

export function ReportStoryControl({ postId }: { postId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]>("Safety concern");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true); setError(""); setMessage("");
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push(`/login?next=/story/${postId}`);
        return;
      }
      const response = await fetch("/api/trust/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetType: "post", targetId: postId, reason, detail }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Report could not be submitted.");
      setMessage("Report submitted to Playbook Trust & Safety.");
      setDetail("");
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Report could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={shell} aria-label="Report this Playbook story">
      {!open ? <button type="button" onClick={() => { setOpen(true); setError(""); }} style={linkButton}>Report story</button> : (
        <div style={panel}>
          <strong style={title}>Report this story</strong>
          <p style={copy}>Send this story to Playbook Trust & Safety for human review.</p>
          <label style={label}>Reason
            <select value={reason} onChange={(event) => setReason(event.target.value as (typeof REASONS)[number])} style={input}>
              {REASONS.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label style={label}>Additional detail (optional)
            <textarea value={detail} onChange={(event) => setDetail(event.target.value)} maxLength={2000} style={textarea} />
          </label>
          <div style={actions}>
            <button type="button" onClick={() => void submit()} disabled={busy} style={primary}>{busy ? "Submitting…" : "Submit report"}</button>
            <button type="button" onClick={() => setOpen(false)} disabled={busy} style={secondary}>Cancel</button>
          </div>
        </div>
      )}
      {message && <p role="status" style={success}>{message}</p>}
      {error && <p role="alert" style={failure}>{error}</p>}
    </section>
  );
}

const shell: React.CSSProperties = { marginTop: 18 };
const linkButton: React.CSSProperties = { border: 0, padding: 0, background: "transparent", color: "#B45309", fontWeight: 850, cursor: "pointer" };
const panel: React.CSSProperties = { padding: 16, border: "1px solid #E2E8F0", borderRadius: 16, background: "#F8FAFC" };
const title: React.CSSProperties = { color: "#0F172A" };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.5 };
const label: React.CSSProperties = { display: "grid", gap: 6, marginTop: 12, color: "#334155", fontWeight: 800 };
const input: React.CSSProperties = { padding: 10, border: "1px solid #CBD5E1", borderRadius: 10, background: "#FFFFFF" };
const textarea: React.CSSProperties = { minHeight: 90, padding: 10, border: "1px solid #CBD5E1", borderRadius: 10, resize: "vertical" };
const actions: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 };
const primary: React.CSSProperties = { border: 0, borderRadius: 999, padding: "10px 14px", background: "#0F172A", color: "#FFFFFF", fontWeight: 900, cursor: "pointer" };
const secondary: React.CSSProperties = { ...primary, background: "#E2E8F0", color: "#0F172A" };
const success: React.CSSProperties = { color: "#166534", fontWeight: 800 };
const failure: React.CSSProperties = { color: "#991B1B", fontWeight: 800 };

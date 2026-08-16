"use client";

import { useEffect, useState } from "react";

type Relationship = {
  id: string;
  scholar_id: string;
  supporter_id: string | null;
  supporter_email: string;
  supporter_name: string | null;
  relationship: string;
  permissions: string[];
  status: "active" | "removed" | "blocked";
  source_invitation_id: string | null;
  created_at: string;
  ended_at: string | null;
  ended_by: string | null;
  end_reason: string | null;
  perspective: "scholar" | "supporter";
};

type LoadState = "loading" | "ready" | "error";

export default function LiveSupportRelationships() {
  const [state, setState] = useState<LoadState>("loading");
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function reload() {
    const response = await fetch("/api/support-relationships", { cache: "no-store" });
    const result = await response.json() as { error?: string; relationships?: Relationship[] };
    if (!response.ok) {
      setMessage(result.error ?? "Support relationships could not be loaded.");
      return;
    }
    setRelationships(result.relationships ?? []);
    setMessage(null);
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await fetch("/api/support-relationships", { cache: "no-store" });
      const result = await response.json() as { error?: string; relationships?: Relationship[] };
      if (!active) return;
      if (!response.ok) {
        setMessage(result.error ?? "Support relationships could not be loaded.");
        setState("error");
        return;
      }
      setRelationships(result.relationships ?? []);
      setState("ready");
    })();
    return () => { active = false; };
  }, []);

  async function revoke(relationshipId: string) {
    setRevokingId(relationshipId);
    setMessage(null);
    const response = await fetch("/api/support-relationships/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relationshipId }),
    });
    const result = await response.json() as { error?: string; message?: string };
    setRevokingId(null);
    if (!response.ok) {
      setMessage(result.error ?? "Support relationship could not be removed.");
      return;
    }
    setMessage(result.message ?? "Support relationship removed.");
    await reload();
  }

  if (state === "loading") {
    return <section style={panel}><p style={eyebrow}>Live relationships</p><h2 style={heading}>Loading canonical support access…</h2></section>;
  }

  if (state === "error") {
    return <section style={panel}><p style={eyebrow}>Live relationships</p><h2 style={heading}>Relationship data unavailable</h2><p style={copy}>{message}</p></section>;
  }

  const active = relationships.filter((relationship) => relationship.status === "active");
  const history = relationships.filter((relationship) => relationship.status !== "active");

  return (
    <section style={panel} data-testid="live-support-relationships">
      <p style={eyebrow}>Live relationships</p>
      <h2 style={heading}>Canonical support access</h2>
      <p style={copy}>These records come from your authenticated support relationships. Removing access revokes relationship permissions immediately while preserving history.</p>
      {message && <div style={notice}>{message}</div>}

      <div style={sectionBlock}>
        <h3 style={sectionTitle}>Active · {active.length}</h3>
        {active.length === 0 ? <p style={empty}>No active support relationships.</p> : (
          <div style={list}>
            {active.map((relationship) => (
              <article key={relationship.id} style={relationshipCard}>
                <div>
                  <strong style={name}>{relationship.supporter_name || relationship.supporter_email}</strong>
                  <p style={meta}>{relationship.relationship.replaceAll("_", " ")} · You are the {relationship.perspective}</p>
                  <p style={meta}>{relationship.permissions.length === 0 ? "No Scholar-data permissions" : relationship.permissions.map(permission => permission.replaceAll("_", " ")).join(" · ")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void revoke(relationship.id)}
                  disabled={revokingId === relationship.id}
                  style={removeButton}
                >
                  {revokingId === relationship.id ? "Removing…" : "Remove access"}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div style={sectionBlock}>
          <h3 style={sectionTitle}>History · {history.length}</h3>
          <div style={list}>
            {history.map((relationship) => (
              <article key={relationship.id} style={historyCard}>
                <div>
                  <strong style={name}>{relationship.supporter_name || relationship.supporter_email}</strong>
                  <p style={meta}>{relationship.relationship.replaceAll("_", " ")} · {relationship.status}</p>
                  {relationship.ended_at && <p style={meta}>Ended {new Date(relationship.ended_at).toLocaleDateString()}</p>}
                </div>
                <span style={historyBadge}>{relationship.status}</span>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const panel: React.CSSProperties = { maxWidth: 1120, margin: "22px auto 0", padding: 24, borderRadius: 24, background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 16px 40px rgba(15,23,42,.06)" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#F97316", fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" };
const heading: React.CSSProperties = { margin: "8px 0", color: "#0F172A", fontSize: 28 };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.6, margin: 0 };
const notice: React.CSSProperties = { marginTop: 14, padding: 12, borderRadius: 12, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#9A3412" };
const sectionBlock: React.CSSProperties = { marginTop: 22 };
const sectionTitle: React.CSSProperties = { color: "#0F172A", fontSize: 16, margin: "0 0 10px" };
const list: React.CSSProperties = { display: "grid", gap: 10 };
const relationshipCard: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: 16, border: "1px solid #E2E8F0", borderRadius: 16 };
const historyCard: React.CSSProperties = { ...relationshipCard, background: "#F8FAFC" };
const name: React.CSSProperties = { color: "#0F172A" };
const meta: React.CSSProperties = { margin: "5px 0 0", color: "#64748B", fontSize: 12, lineHeight: 1.5 };
const empty: React.CSSProperties = { color: "#64748B", margin: 0 };
const removeButton: React.CSSProperties = { border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#B91C1C", borderRadius: 999, padding: "9px 12px", fontWeight: 850, cursor: "pointer", whiteSpace: "nowrap" };
const historyBadge: React.CSSProperties = { borderRadius: 999, padding: "6px 9px", background: "#E2E8F0", color: "#475569", fontSize: 11, fontWeight: 850, textTransform: "uppercase" };

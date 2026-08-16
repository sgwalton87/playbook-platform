"use client";

import { useEffect, useState } from "react";

type SecurityEvent = {
  id: string;
  relationship_id: string;
  relationship: string;
  event_type: string;
  actor_id: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_permissions: string[] | null;
  new_permissions: string[] | null;
  occurred_at: string;
};

type LoadState = "loading" | "ready" | "error";

const LABELS: Record<string, string> = {
  "relationship.activated": "Relationship activated",
  "relationship.revoked": "Access removed",
  "relationship.blocked": "Relationship blocked",
  "relationship.status_changed": "Relationship status changed",
  "relationship.permissions_changed": "Permissions changed",
};

export default function RelationshipSecurityHistory() {
  const [state, setState] = useState<LoadState>("loading");
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await fetch("/api/support-relationships/security-events?limit=50", { cache: "no-store" });
      const result = await response.json() as { error?: string; events?: SecurityEvent[] };
      if (!active) return;
      if (!response.ok) {
        setError(result.error ?? "Relationship security history could not be loaded.");
        setState("error");
        return;
      }
      setEvents(result.events ?? []);
      setState("ready");
    })();
    return () => { active = false; };
  }, []);

  if (state === "loading") {
    return <section style={panel}><p style={eyebrow}>Security history</p><h2 style={heading}>Loading relationship audit events…</h2></section>;
  }

  if (state === "error") {
    return <section style={panel}><p style={eyebrow}>Security history</p><h2 style={heading}>Audit history unavailable</h2><p style={copy}>{error}</p></section>;
  }

  return (
    <section style={panel} data-testid="relationship-security-history">
      <p style={eyebrow}>Security history</p>
      <h2 style={heading}>Relationship access changes</h2>
      <p style={copy}>This append-only history records security-relevant relationship changes visible to the Scholar and connected supporter.</p>

      {events.length === 0 ? (
        <p style={empty}>No relationship security events have been recorded yet.</p>
      ) : (
        <div style={list}>
          {events.map((event) => (
            <article key={event.id} style={eventCard}>
              <div>
                <strong style={title}>{LABELS[event.event_type] ?? event.event_type}</strong>
                <p style={meta}>{event.relationship.replaceAll("_", " ")} · {new Date(event.occurred_at).toLocaleString()}</p>
                {event.previous_status !== event.new_status && (
                  <p style={meta}>Status: {event.previous_status ?? "none"} → {event.new_status ?? "none"}</p>
                )}
                {event.event_type === "relationship.permissions_changed" && (
                  <p style={meta}>Permissions: {(event.previous_permissions ?? []).length} → {(event.new_permissions ?? []).length}</p>
                )}
              </div>
              <span style={badge}>audited</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const panel: React.CSSProperties = { maxWidth: 1120, margin: "16px auto 0", padding: 24, borderRadius: 24, background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 16px 40px rgba(15,23,42,.05)" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#F97316", fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" };
const heading: React.CSSProperties = { margin: "8px 0", color: "#0F172A", fontSize: 26 };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.6, margin: 0 };
const empty: React.CSSProperties = { margin: "18px 0 0", color: "#64748B" };
const list: React.CSSProperties = { display: "grid", gap: 10, marginTop: 18 };
const eventCard: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, border: "1px solid #E2E8F0", borderRadius: 16, padding: 15, background: "#F8FAFC" };
const title: React.CSSProperties = { color: "#0F172A" };
const meta: React.CSSProperties = { margin: "5px 0 0", color: "#64748B", fontSize: 12, lineHeight: 1.5 };
const badge: React.CSSProperties = { borderRadius: 999, padding: "6px 9px", background: "#ECFDF5", color: "#047857", fontSize: 10, fontWeight: 900, textTransform: "uppercase" };

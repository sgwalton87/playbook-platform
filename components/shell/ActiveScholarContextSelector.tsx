"use client";

import { useEffect, useState } from "react";
import ProfileAvatar from "@/components/ProfileAvatar";

type SupportContext = {
  relationship_id: string;
  scholar_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  relationship: string;
  permissions: string[] | Record<string, unknown>;
};

type ContextResponse = { available?: SupportContext[]; active?: SupportContext | null; error?: string };

export default function ActiveScholarContextSelector({ compact = false }: { compact?: boolean }) {
  const [available, setAvailable] = useState<SupportContext[]>([]);
  const [active, setActive] = useState<SupportContext | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    void fetch("/api/support-context", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json() as ContextResponse;
        if (!response.ok) throw new Error(body.error || "Scholar context could not be loaded.");
        if (!mounted) return;
        setAvailable(body.available ?? []);
        setActive(body.active ?? null);
      })
      .catch((cause) => {
        if (mounted) setError(cause instanceof Error ? cause.message : "Scholar context could not be loaded.");
      });
    return () => { mounted = false; };
  }, []);

  async function select(relationshipId: string) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/support-context", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ relationshipId: relationshipId || null }),
      });
      const body = await response.json() as ContextResponse;
      if (!response.ok) throw new Error(body.error || "Scholar context could not be updated.");
      setActive(body.active ?? null);
      window.dispatchEvent(new CustomEvent("playbook:active-scholar-context", { detail: body.active ?? null }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Scholar context could not be updated.");
    } finally { setBusy(false); }
  }

  if (available.length === 0) return null;

  if (compact) {
    return <div title={active ? `Working with ${active.display_name}` : "Choose Scholar context"} style={compactWrap}>
      <ProfileAvatar src={active?.avatar_url} name={active?.display_name || "Scholar"} size={34} />
    </div>;
  }

  return (
    <section aria-label="Active Scholar context" style={panel}>
      <div style={heading}>Working with</div>
      <div style={activeRow}>
        <ProfileAvatar src={active?.avatar_url} name={active?.display_name || "Scholar"} size={38} />
        <div style={{ minWidth: 0 }}>
          <strong style={name}>{active?.display_name || "Choose a Scholar"}</strong>
          <div style={meta}>{active ? active.relationship.replaceAll("_", " ") : "Active support relationships only"}</div>
        </div>
      </div>
      <select aria-label="Choose active Scholar" value={active?.relationship_id || ""} disabled={busy}
        onChange={(event) => void select(event.target.value)} style={selectStyle}>
        <option value="">No active Scholar</option>
        {available.map((item) => <option key={item.relationship_id} value={item.relationship_id}>{item.display_name} · {item.relationship.replaceAll("_", " ")}</option>)}
      </select>
      {error && <p role="alert" style={errorStyle}>{error}</p>}
    </section>
  );
}

const panel: React.CSSProperties = { margin: "0 8px 14px", padding: 11, borderRadius: 16, background: "rgba(249,115,22,.10)", border: "1px solid rgba(251,146,60,.24)" };
const heading: React.CSSProperties = { color: "rgba(255,255,255,.65)", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 };
const activeRow: React.CSSProperties = { display: "flex", gap: 9, alignItems: "center", marginBottom: 9 };
const name: React.CSSProperties = { display: "block", color: "#FFF7ED", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 12 };
const meta: React.CSSProperties = { color: "rgba(255,255,255,.58)", fontSize: 10, textTransform: "capitalize", marginTop: 2 };
const selectStyle: React.CSSProperties = { width: "100%", padding: "8px 9px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", background: "#0F172A", color: "#F8FAFC", fontSize: 11 };
const errorStyle: React.CSSProperties = { color: "#FED7AA", fontSize: 10, lineHeight: 1.4, margin: "7px 0 0" };
const compactWrap: React.CSSProperties = { display: "flex", justifyContent: "center", margin: "0 auto 12px" };

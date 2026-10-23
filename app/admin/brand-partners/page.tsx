"use client";

import { useEffect, useState } from "react";

type Review = {
  request_id: string; organization_name: string; brand_category: string | null;
  status: string; campaign_scope_approved: boolean;
  compliance_scope_approved: boolean; submitted_at: string;
};
const scopes = ["organization", "campaign", "compliance"] as const;

export default function BrandPartnerAdminReview() {
  const [items, setItems] = useState<Review[]>([]);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const response = await fetch("/api/admin/brand-partners", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Review access unavailable"); setItems([]); }
    else { setError(""); setItems(data.requests || []); }
    setLoading(false);
  }
  useEffect(() => {
    const handle = window.setTimeout(() => { void reload(); }, 0);
    return () => window.clearTimeout(handle);
  }, []);
  async function decide(id: string, scope: string, decision: "approve" | "reject") {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/brand-partners", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, scope, decision, reason: reason[id] || "" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Review action failed");
      await reload();
    } catch (err) { setError(err instanceof Error ? err.message : "Review action failed"); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 1040, margin: "auto", padding: 28, color: "#12223b" }}>
    <p style={{ letterSpacing: 2, color: "#c55217" }}>THE PLAYBOOK · ADMINISTRATION</p>
    <h1>Brand Partner review queue</h1>
    <p>Independent organization, campaign and compliance decisions. Every decision requires a reason and creates an audit entry.</p>
    {loading && <p>Checking reviewer access…</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {!loading && !error && items.length === 0 && <p>No Brand Partner verification requests yet.</p>}
    {items.map(item => <section key={item.request_id} style={{ border: "1px solid #cbd5e1", borderRadius: 12, padding: 20, margin: "20px 0" }}>
      <h2>{item.organization_name}</h2>
      <p>{item.brand_category || "Brand Partner"} · {item.status} · Submitted {new Date(item.submitted_at).toLocaleDateString()}</p>
      <p>Campaign: {item.campaign_scope_approved ? "approved" : "pending"} · Compliance: {item.compliance_scope_approved ? "approved" : "pending"}</p>
      <label htmlFor={item.request_id}>Decision rationale (minimum 8 characters)</label>
      <textarea id={item.request_id} value={reason[item.request_id] || ""} onChange={e => setReason(old => ({ ...old, [item.request_id]: e.target.value }))} style={{ display: "block", width: "100%", minHeight: 80, margin: "8px 0 16px" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {scopes.map(scope => <div key={scope} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <strong>{scope}</strong>
          <button disabled={busy || item.status === "rejected"} onClick={() => void decide(item.request_id, scope, "approve")}>Approve</button>
          <button disabled={busy || item.status === "rejected"} onClick={() => void decide(item.request_id, scope, "reject")}>Reject</button>
        </div>)}
      </div>
    </section>)}
  </main>;
}

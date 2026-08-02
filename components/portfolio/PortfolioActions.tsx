"use client";

import { useState } from "react";

type ShareSummary = { share_id: string; status: string; expires_at: string | null };

export default function PortfolioActions({ shares }: { shares: ShareSummary[] }) {
  const [message, setMessage] = useState("");

  async function createShare() {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const response = await fetch("/api/portfolio/shares", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUse: "college", sections: ["identity", "readiness", "verified_evidence"], expiresAt }) });
    const result = await response.json();
    setMessage(response.ok ? `Share created: ${result.shareUrl}` : result.error || "Share failed.");
  }

  async function exportPdf() {
    const response = await fetch("/api/portfolio/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUse: "college", sections: ["identity", "readiness", "verified_evidence"] }) });
    if (!response.ok) return setMessage("Export failed.");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Playbook_Portfolio.pdf";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Portfolio exported.");
  }

  async function revokeShare(shareId: string) {
    const response = await fetch(`/api/portfolio/shares?shareId=${encodeURIComponent(shareId)}`, { method: "DELETE" });
    setMessage(response.ok ? "Share revoked." : "Share could not be revoked.");
    if (response.ok) window.location.reload();
  }

  return <section aria-labelledby="portfolio-actions"><h2 id="portfolio-actions">Share and export</h2><div aria-live="polite" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button onClick={createShare}>Create 30-day share</button>
      <button onClick={exportPdf}>Export PDF</button>
      {message && <p>{message}</p>}
    </div>
    <ul>{shares.map((share) => <li key={share.share_id}><a href={`/portfolio/${share.share_id}`}>{share.share_id}</a> · {share.status} · {share.expires_at ? `expires ${new Date(share.expires_at).toLocaleDateString()}` : "no expiration"} {share.status === "active" && <button onClick={() => revokeShare(share.share_id)}>Revoke</button>}</li>)}</ul>
  </section>;
}

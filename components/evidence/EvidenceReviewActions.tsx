"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EvidenceReviewActions({ evidenceId, requestId }: { evidenceId: string; requestId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");

  async function review(decision: "verified" | "rejected") {
    setPending(true);
    if (!reason.trim()) return setMessage("A decision reason is required.");
    const response = await fetch(`/api/evidence/${evidenceId}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, decision, reason }) });
    const result = await response.json();
    setMessage(response.ok ? `Evidence ${decision}.` : result.error || "Review failed.");
    setPending(false);
    if (response.ok) router.refresh();
  }

  return <div aria-live="polite" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
    <label>Decision reason <input value={reason} onChange={(event) => setReason(event.target.value)} /></label>
    <button disabled={pending} onClick={() => review("verified")}>Verify</button>
    <button disabled={pending} onClick={() => review("rejected")}>Reject</button>
    {message && <span>{message}</span>}
  </div>;
}

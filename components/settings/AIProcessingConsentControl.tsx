"use client";

import { useState } from "react";

export function AIProcessingConsentControl({ initialStatus }: { initialStatus: "granted" | "denied" | "withdrawn" }) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function update(nextStatus: "granted" | "withdrawn") {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/settings/ai-consent", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Consent could not be updated.");
      setStatus(nextStatus);
      setMessage(nextStatus === "granted" ? "AI processing consent granted." : "AI processing consent withdrawn.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Consent could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  return <section style={{ maxWidth: 960, margin: "18px auto", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24 }} aria-labelledby="ai-consent-title">
    <p style={{ color: "#C2410C", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".12em", fontSize: 11 }}>AI processing</p>
    <h2 id="ai-consent-title">Human authority stays with you</h2>
    <p>Optional AI guidance sends the prompt you enter to the configured provider. Playbook fixes the model settings, limits prompt size and usage, and treats output as guidance—not a decision or verified fact. Core workflows remain available without consent.</p>
    <p><strong>Current status:</strong> {status}</p>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button type="button" disabled={saving || status === "granted"} onClick={() => void update("granted")}>Grant AI processing consent</button>
      <button type="button" disabled={saving || status !== "granted"} onClick={() => void update("withdrawn")}>Withdraw consent</button>
    </div>
    {message && <p role="status" aria-live="polite">{message}</p>}
  </section>;
}

"use client";

import { useState } from "react";

export default function RequestVerificationButton({ evidenceId }: { evidenceId: string }) {
  const [message, setMessage] = useState("");
  return <div aria-live="polite"><button onClick={async () => {
    const response = await fetch("/api/evidence/verification-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ evidenceId }) });
    const result = await response.json();
    setMessage(response.ok ? "Verification requested." : result.error || "Request failed.");
  }}>Request verification</button>{message && <span> {message}</span>}</div>;
}

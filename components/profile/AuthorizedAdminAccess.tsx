"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/** Visibility follows the existing server-governed reviewer authority, never an email allowlist. */
export default function AuthorizedAdminAccess() {
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/verification", { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) setAuthorized(response.ok); })
      .catch(() => { if (!controller.signal.aborted) setAuthorized(false); });
    return () => controller.abort();
  }, []);
  if (!authorized) return null;
  return (
    <section aria-label="Additional authorized workspace" style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 18, background: "#FFF", marginBottom: 20 }}>
      <strong>Administrative access</strong>
      <p style={{ margin: "8px 0 12px" }}>Your existing Playbook role remains active. You also have separate reviewer authority.</p>
      <Link href="/admin" style={{ display: "inline-block", borderRadius: 10, padding: "12px 16px", background: "#17365B", color: "#FFF", textDecoration: "none", fontWeight: 700 }}>Open Admin Verification Center</Link>
    </section>
  );
}

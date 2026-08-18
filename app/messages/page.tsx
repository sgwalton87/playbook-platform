"use client";

import Link from "next/link";
import { Suspense } from "react";
import InboxV2 from "@/components/messages/InboxV2";

export default function MessagesPage() {
  return <>
    <div style={{ maxWidth: 1180, margin: "12px auto 0", padding: "0 16px" }}>
      <Link href="/messages/meeting-links" style={{ fontWeight: 800 }}>Share meeting link →</Link>
    </div>
    <Suspense fallback={<p role="status" aria-live="polite">Loading governed conversations…</p>}><InboxV2 /></Suspense>
  </>;
}

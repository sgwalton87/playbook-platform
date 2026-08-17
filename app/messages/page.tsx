"use client";

import { Suspense } from "react";
import InboxV2 from "@/components/messages/InboxV2";

export default function MessagesPage() {
  return <Suspense fallback={<p role="status" aria-live="polite">Loading governed conversations…</p>}><InboxV2 /></Suspense>;
}

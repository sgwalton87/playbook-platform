"use client";

import { useEffect, useState } from "react";

type Document = { name: string; type: string; url: string };
export default function BrandEvidenceReviewPanel({ requestId, onReviewed }: {
  requestId: string; onReviewed: (reviewed: boolean) => void;
}) {
  const [documents, setDocuments] = useState<Document[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const invalidate = () => setDocuments(null);
    window.addEventListener("brand-verification-documents-changed", invalidate);
    return () => window.removeEventListener("brand-verification-documents-changed", invalidate);
  }, []);

  async function load() {
    setBusy(true);
    setError("");
    setDocuments(null);
    onReviewed(false);
    try {
      const response = await fetch(`/api/admin/verification/brand-evidence?requestId=${encodeURIComponent(requestId)}`, { cache: "no-store" });
      const body = await response.json() as { documents?: Document[]; error?: string };
      if (!response.ok) throw new Error(body.error || "Could not load evidence.");
      setDocuments(body.documents ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load private verification documents.");
    } finally { setBusy(false); }
  }

  return <section aria-label="Private Brand Partner business evidence" style={{ padding: 14, border: "1px solid #CBD5E1", background: "#F8FAFC", borderRadius: 12, color: "#0F172A" }}>
    <strong>Private business verification documents</strong>
    <p>Review the organization&apos;s letterhead or business card before approving. Review target: 72 hours. Documents stay available in the admin folder after review. Each file open requires an authorized admin session.</p>
    <button type="button" disabled={busy} onClick={() => void load()}>{busy ? "Loading…" : "Open submitted evidence"}</button>
    {error && <p role="alert" style={{ color: "#991B1B" }}>{error}</p>}
    {documents && (documents.length
      ? <>
        <ul>{documents.map(document => <li key={document.name}><a href={document.url} target="_blank" rel="noopener noreferrer">{document.type} — view private file</a></li>)}</ul>
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <input type="checkbox" onChange={event => onReviewed(event.target.checked)} />
          I reviewed the business documentation and compared its identity with the submitted organization.
        </label>
      </>
      : <p role="status">No business documents on file. This verification cannot be approved.</p>)}
  </section>;
}

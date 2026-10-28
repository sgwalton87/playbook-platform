"use client";
import { useCallback, useEffect, useState } from "react";
import type { BrandDocument } from "@/lib/brand-verification/documents";

export default function BrandVerificationDocumentLibrary() {
  const [documents, setDocuments] = useState<BrandDocument[]>([]);
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [inbox, setInbox] = useState("onboarding@playbookseriesinc.org");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/verification/brand-evidence?archived=${archived}&page=${page}`, { cache: "no-store", signal });
      const body = await response.json() as { documents?: BrandDocument[]; hasMore?: boolean; reviewInbox?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "Document folder could not be loaded.");
      if (signal?.aborted) return;
      setDocuments(body.documents ?? []); setHasMore(Boolean(body.hasMore));
      setInbox(body.reviewInbox || "onboarding@playbookseriesinc.org");
    } catch (cause) {
      if (!signal?.aborted) { setDocuments([]); setError(cause instanceof Error ? cause.message : "Document folder could not be loaded."); }
    } finally { if (!signal?.aborted) setLoading(false); }
  }, [archived, page]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => { void load(controller.signal); }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [load]);

  useEffect(() => {
    const refresh = () => { void load(); };
    window.addEventListener("brand-verification-review-completed", refresh);
    return () => window.removeEventListener("brand-verification-review-completed", refresh);
  }, [load]);

  async function archive(document: BrandDocument) {
    const reason = (reasons[document.id] || "").trim();
    if (!reason) return;
    setBusyId(document.id); setError("");
    try {
      const response = await fetch("/api/admin/verification/brand-evidence/archive", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId: document.id, reason }),
      });
      if (!response.ok) throw new Error("Document could not be archived. Try again.");
      setReasons(previous => ({ ...previous, [document.id]: "" }));
      await load();
      window.dispatchEvent(new Event("brand-verification-documents-changed"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Document could not be archived."); }
    finally { setBusyId(""); }
  }

  return <section id="brand-verification-documents" aria-labelledby="brand-document-folder-title" style={{ maxWidth: 1180, margin: "24px auto", padding: "clamp(16px,3vw,28px)", border: "1px solid #CBD5E1", background: "#FFF", borderRadius: 20, color: "#15243A" }}>
    <h2 id="brand-document-folder-title">Brand Partner verification documents</h2>
    <p>Admin-only folder · Review inbox: <a href={`mailto:${inbox}`} style={{ overflowWrap: "anywhere" }}>{inbox}</a></p>
    <p>Review target: 72 hours from submission. Documents remain available after review. Archive keeps the file and its history; documents are not automatically deleted or expired. Every open checks your admin access.</p>
    <div role="group" aria-label="Document folders" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      <button type="button" aria-pressed={!archived} disabled={Boolean(busyId)} onClick={() => { setArchived(false); setPage(0); }}>Active documents</button>
      <button type="button" aria-pressed={archived} disabled={Boolean(busyId)} onClick={() => { setArchived(true); setPage(0); }}>Archived documents</button>
      <button type="button" disabled={loading || Boolean(busyId)} onClick={() => void load()}>Refresh folder</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {loading ? <p role="status">Loading private documents…</p> : error ? null : documents.length === 0 ? <p>No {archived ? "archived" : "active"} documents in this folder.</p> : <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      {documents.map(document => <article key={document.id} style={{ padding: 16, border: "1px solid #E2E8F0", borderRadius: 12, minWidth: 0 }}>
        <h3 style={{ margin: "0 0 8px" }}>{document.organizationName} · {document.type}</h3>
        <p>Verification: {document.status} · Uploaded {new Date(document.uploadedAt).toLocaleString()}</p>
        {document.reviewDueAt && ["pending", "under_review"].includes(document.status) && <p>Review target: {new Date(document.reviewDueAt).toLocaleString()}</p>}
        <a href={document.url} target="_blank" rel="noopener noreferrer">Open {document.type.toLowerCase()} — admin access required</a>
        {document.archivedAt ? <p>Archived {new Date(document.archivedAt).toLocaleString()} · {document.archiveReason}</p> : <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          <label htmlFor={`archive-reason-${document.id}`}>Archive reason</label>
          <textarea id={`archive-reason-${document.id}`} value={reasons[document.id] || ""} onChange={event => setReasons(previous => ({ ...previous, [document.id]: event.target.value }))} maxLength={2000} rows={2} style={{ width: "100%", boxSizing: "border-box" }} />
          <button type="button" disabled={Boolean(busyId) || !(reasons[document.id] || "").trim()} onClick={() => void archive(document)}>{busyId === document.id ? "Archiving…" : "Archive document"}</button>
        </div>}
      </article>)}
    </div>}
    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      <button type="button" disabled={page === 0 || loading || Boolean(busyId)} onClick={() => setPage(previous => previous - 1)}>Previous page</button>
      <button type="button" disabled={!hasMore || loading || Boolean(busyId)} onClick={() => setPage(previous => previous + 1)}>Next page</button>
    </div>
  </section>;
}

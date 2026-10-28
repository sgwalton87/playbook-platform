"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "brand-verification-evidence";
const MAX_SIZE = 5 * 1024 * 1024;
type Document = { name: string; type: string };
export default function BrandVerificationEvidenceUpload({ onEvidenceChange }: { onEvidenceChange?: (hasEvidence: boolean) => void }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sign in to manage business evidence."); onEvidenceChange?.(false); return; }
    const result = await supabase.storage.from(BUCKET).list(user.id, { limit: 100 });
    if (result.error) { setError("Could not check saved business evidence."); onEvidenceChange?.(false); return; }
    const entries = (result.data ?? []).filter(item => item.name.startsWith("letterhead-") || item.name.startsWith("business-card-"));
    setDocuments(entries.map(item => ({ name: item.name, type: item.name.startsWith("letterhead-") ? "Company letterhead" : "Business card" })));
    onEvidenceChange?.(entries.length > 0);
  }, [onEvidenceChange]);
  useEffect(() => { void refresh(); }, [refresh]);

  async function upload(file: File | undefined, type: "letterhead" | "business-card") {
    if (!file) return;
    setError(""); setMessage("");
    if (file.size > MAX_SIZE || !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Upload a PDF, JPG, PNG or WEBP file no larger than 5 MB."); return;
    }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to upload evidence.");
      const extension = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/${type}-${crypto.randomUUID()}.${extension}`;
      const result = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
      if (result.error) throw new Error(result.error.message);
      setMessage("Document uploaded privately. It is awaiting independent verification, not approved.");
      await refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(false); }
  }

  return <section aria-label="Business verification documents" style={{ marginTop: 16, padding: 16, border: "1px solid #CBD5E1", background: "#FFFFFF", borderRadius: 14, color: "#15243A" }}>
    <strong>Business verification documents</strong>
    <p>Upload at least one supporting document showing your organization identity: a company-letterhead document with your business name or a business card showing your business name and contact information. Uploads are private and reviewed before any approval.</p>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <label>Company letterhead <input aria-label="Upload company letterhead" disabled={busy} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={event => void upload(event.target.files?.[0], "letterhead")} /></label>
      <label>Business card <input aria-label="Upload business card" disabled={busy} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={event => void upload(event.target.files?.[0], "business-card")} /></label>
    </div>
    {documents.length ? <ul>{documents.map(item => <li key={item.name}>{item.type} — securely uploaded</li>)}</ul> : <p>No supporting documents uploaded yet.</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
    {error && <p role="alert" style={{ color: "#991B1B" }}>{error}</p>}
  </section>;
}

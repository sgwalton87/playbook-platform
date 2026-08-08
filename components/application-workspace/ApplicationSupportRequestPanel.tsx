"use client";

import { FormEvent, useEffect, useState } from "react";

type Workspace = { id: string; opportunity_name: string; status: string; deadline?: string | null };
type Relationship = { id: string; supporter_name?: string | null; supporter_email: string; relationship: string };
type SupportContext = { workspaces: Workspace[]; relationships: Relationship[]; categories: string[] };

async function fetchSupportContext(): Promise<SupportContext> {
  const response = await fetch("/api/pbos/application-support", { cache: "no-store" });
  const result = await response.json() as SupportContext & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Support options could not be loaded.");
  return result;
}

export default function ApplicationSupportRequestPanel() {
  const [context, setContext] = useState<SupportContext>({ workspaces: [], relationships: [], categories: [] });
  const [workspaceId, setWorkspaceId] = useState(""); const [relationshipId, setRelationshipId] = useState("");
  const [category, setCategory] = useState("RECOMMENDATION"); const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("Loading your application support options…"); const [error, setError] = useState("");

  useEffect(() => { let active = true; void fetchSupportContext().then(result => { if (!active) return;
      setContext(result); setWorkspaceId(current => current || result.workspaces[0]?.id || "");
      setRelationshipId(current => current || result.relationships[0]?.id || "");
      setCategory(current => current || result.categories[0] || "RECOMMENDATION");
      setStatus(result.workspaces.length && result.relationships.length ? "Choose an application and authorized supporter."
        : "Create an application workspace and activate a support relationship before requesting help.");
    }).catch(cause => { if (active) { setError(cause instanceof Error ? cause.message : "Support options could not be loaded."); setStatus(""); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; }; }, []);

  async function reload() { setLoading(true); setError(""); try { const result = await fetchSupportContext();
      setContext(result); setWorkspaceId(current => current || result.workspaces[0]?.id || "");
      setRelationshipId(current => current || result.relationships[0]?.id || ""); setCategory(current => current || result.categories[0] || "RECOMMENDATION");
      setStatus(result.workspaces.length && result.relationships.length ? "Choose an application and authorized supporter."
        : "Create an application workspace and activate a support relationship before requesting help.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Support options could not be loaded."); setStatus(""); }
    finally { setLoading(false); } }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setSubmitting(true); setStatus("Sending your governed support request…");
    try {
      const response = await fetch("/api/pbos/application-support", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ workspaceId, relationshipId, category, summary, requestId: crypto.randomUUID() }) });
      const result = await response.json() as { request?: { requestId: string }; error?: string };
      if (!response.ok || !result.request) throw new Error(result.error ?? "Support request could not be created.");
      setSummary(""); setStatus("Support request created and delivered with PBOS provenance. Reference " + result.request.requestId + ".");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Support request could not be created."); setStatus(""); }
    finally { setSubmitting(false); }
  }

  const unavailable = loading || !context.workspaces.length || !context.relationships.length;
  return <section aria-labelledby="application-support-heading" style={{ marginTop: 24, border: "1px solid #E2E8F0", borderRadius: 24, padding: 24, background: "#FFFFFF" }}>
    <p style={{ color: "#B45309", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>Authorized support</p>
    <h2 id="application-support-heading">Ask your support network for application help</h2>
    <p id="application-support-description">Only active relationships with support-task permission can receive this request.</p>
    {error && <div role="alert" aria-live="assertive"><p>{error}</p><button type="button" onClick={() => void reload()}>Try again</button></div>}
    <p role="status" aria-live="polite">{status}</p>
    <form onSubmit={submit} aria-describedby="application-support-description" style={{ display: "grid", gap: 14, maxWidth: 720 }}>
      <label>Application workspace<select value={workspaceId} onChange={event => setWorkspaceId(event.target.value)} disabled={unavailable || submitting} required>
        <option value="">Choose an application</option>{context.workspaces.map(item => <option key={item.id} value={item.id}>{item.opportunity_name}</option>)}</select></label>
      <label>Authorized supporter<select value={relationshipId} onChange={event => setRelationshipId(event.target.value)} disabled={unavailable || submitting} required>
        <option value="">Choose a supporter</option>{context.relationships.map(item => <option key={item.id} value={item.id}>{item.supporter_name || item.supporter_email} — {item.relationship}</option>)}</select></label>
      <label>Support category<select value={category} onChange={event => setCategory(event.target.value)} disabled={unavailable || submitting} required>
        {context.categories.map(item => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
      <label>What support do you need?<textarea value={summary} onChange={event => setSummary(event.target.value)} minLength={3} maxLength={500}
        disabled={unavailable || submitting} required rows={5} /></label>
      <button type="submit" disabled={unavailable || submitting}>{submitting ? "Sending…" : "Request support"}</button>
    </form>
  </section>;
}

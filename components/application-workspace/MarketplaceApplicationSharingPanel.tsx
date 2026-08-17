"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type Workspace = {
  id: string;
  opportunity_id: string;
  opportunity_name: string;
  status: "building" | "ready" | "submitted";
};

type PublishedOpportunity = {
  id: string;
  organization_name: string;
  title: string;
  opportunity_type: string;
};

type Submission = {
  submission_id: string;
  opportunity_id: string;
  workspace_id: string;
  organization_name: string;
  opportunity_title: string;
  opportunity_type: string;
  submission_status: "submitted" | "withdrawn";
  consented_at: string;
  submitted_at: string;
  withdrawn_at: string | null;
};

const CONSENT_VERSION = "marketplace-applicant-share-v1";

export default function MarketplaceApplicationSharingPanel({ workspaces }: { workspaces: Workspace[] }) {
  const [catalog, setCatalog] = useState<PublishedOpportunity[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [consent, setConsent] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const [catalogResponse, submissionResult] = await Promise.all([
      fetch("/api/marketplace/opportunities", { cache: "no-store" }),
      supabase.rpc("get_my_marketplace_application_submissions"),
    ]);
    const catalogBody = await catalogResponse.json() as { opportunities?: PublishedOpportunity[]; error?: string };
    if (!catalogResponse.ok) { setError(catalogBody.error || "Published Marketplace opportunities could not be loaded."); setLoading(false); return; }
    if (submissionResult.error) { setError(submissionResult.error.message); setLoading(false); return; }
    setCatalog(catalogBody.opportunities || []);
    setSubmissions((submissionResult.data || []) as Submission[]);
    setLoading(false);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  const eligible = useMemo(() => {
    const catalogById = new Map(catalog.map((item) => [item.id, item]));
    return workspaces
      .filter((workspace) => workspace.status === "submitted" && catalogById.has(workspace.opportunity_id))
      .map((workspace) => ({ workspace, opportunity: catalogById.get(workspace.opportunity_id)! }));
  }, [catalog, workspaces]);

  function submissionFor(workspaceId: string) { return submissions.find((item) => item.workspace_id === workspaceId); }

  async function share(workspaceId: string) {
    if (!consent[workspaceId]) { setError("Confirm the applicant-sharing consent before sharing this Application Workspace."); return; }
    setBusy(workspaceId); setError(""); setMessage("");
    const result = await supabase.rpc("submit_marketplace_application", {
      requested_workspace_id: workspaceId,
      requested_consent_version: CONSENT_VERSION,
    });
    if (result.error) { setError(result.error.message); setBusy(""); return; }
    setMessage("Application shared with the listing organization. Only the narrow applicant roster projection is visible; your private workspace and documents remain private.");
    setConsent((current) => ({ ...current, [workspaceId]: false }));
    await load(); setBusy("");
  }

  async function withdraw(submission: Submission) {
    setBusy(submission.submission_id); setError(""); setMessage("");
    const result = await supabase.rpc("withdraw_marketplace_application", { requested_submission_id: submission.submission_id });
    if (result.error) { setError(result.error.message); setBusy(""); return; }
    setMessage("Marketplace applicant sharing withdrawn. The organization no longer sees you in its active applicant roster.");
    await load(); setBusy("");
  }

  return <section aria-labelledby="marketplace-sharing-heading" style={section}>
    <div style={header}><div><p style={eyebrow}>Marketplace Applicant Sharing</p><h2 id="marketplace-sharing-heading" style={heading}>You decide when an organization sees you as an applicant.</h2></div><PlaybookPill>Explicit consent</PlaybookPill></div>
    <p style={copy}>Marking an Application Workspace submitted does not automatically send it to a Brand Partner. For a published Marketplace listing, you must separately consent to applicant sharing. The partner sees only your name, username/avatar, submission timestamp, and application status—not your private documents, essays, evidence, resume, email, or broader Scholar Record.</p>
    {error ? <div role="alert" style={alert}>{error}</div> : null}{message ? <div role="status" aria-live="polite" style={status}>{message}</div> : null}
    {loading ? <div style={empty}>Checking Marketplace sharing eligibility…</div> : eligible.length === 0 ? <PlaybookCard eyebrow="Applicant sharing" title="No submitted Marketplace applications ready to share"><p style={copy}>Start from a published Marketplace opportunity, complete its Application Workspace, and mark the workspace submitted first. Playbook will not share an application automatically.</p></PlaybookCard> : <PlaybookGrid min={340}>
      {eligible.map(({ workspace, opportunity }) => {
        const submission = submissionFor(workspace.id);
        const active = submission?.submission_status === "submitted";
        return <PlaybookCard key={workspace.id} eyebrow={`${opportunity.organization_name} · ${opportunity.opportunity_type}`} title={opportunity.title}>
          <div style={pillRow}><PlaybookPill>Workspace submitted</PlaybookPill>{active ? <PlaybookPill>Shared with organization</PlaybookPill> : submission ? <PlaybookPill>Sharing withdrawn</PlaybookPill> : <PlaybookPill>Not shared</PlaybookPill>}</div>
          {active && submission ? <><p style={copy}>Shared {new Date(submission.submitted_at).toLocaleString()} under consent version {CONSENT_VERSION}.</p><button type="button" disabled={busy === submission.submission_id} onClick={() => void withdraw(submission)} style={secondaryButton}>{busy === submission.submission_id ? "Withdrawing…" : "Withdraw applicant sharing"}</button></> : <>
            <label style={consentRow}><input type="checkbox" checked={Boolean(consent[workspace.id])} onChange={(event) => setConsent((current) => ({ ...current, [workspace.id]: event.target.checked }))} /> I explicitly consent to share my applicant identity and submission status with {opportunity.organization_name}. I understand my private Application Workspace contents and Scholar Record are not included.</label>
            <button type="button" disabled={busy === workspace.id || !consent[workspace.id]} onClick={() => void share(workspace.id)} style={primaryButton}>{busy === workspace.id ? "Sharing…" : "Share application with organization"}</button>
          </>}
        </PlaybookCard>;
      })}
    </PlaybookGrid>}
  </section>;
}

const section: React.CSSProperties = { marginTop: 30, paddingTop: 26, borderTop: "1px solid #CBD5E1" };
const header: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "end", flexWrap: "wrap" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#EA580C", textTransform: "uppercase", letterSpacing: ".1em", fontSize: 11, fontWeight: 900 };
const heading: React.CSSProperties = { margin: "5px 0 0", color: "#0F172A", fontSize: "clamp(24px,4vw,36px)" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const alert: React.CSSProperties = { margin: "12px 0", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const status: React.CSSProperties = { margin: "12px 0", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const empty: React.CSSProperties = { padding: 24, color: "#64748B" };
const pillRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 };
const consentRow: React.CSSProperties = { display: "flex", gap: 10, alignItems: "flex-start", color: "#334155", lineHeight: 1.55, margin: "14px 0" };
const primaryButton: React.CSSProperties = { minHeight: 44, border: 0, borderRadius: 999, padding: "0 16px", background: "#F97316", color: "#FFF", fontWeight: 900, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { ...primaryButton, background: "#FFF", color: "#334155", border: "1px solid #CBD5E1" };

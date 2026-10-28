"use client";

import ApplicationSupportRequestPanel from "@/components/application-workspace/ApplicationSupportRequestPanel";

import { FormEvent, useEffect, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";
import { requirePlaybookRole } from "@/lib/roles/registry";

type Task = { id: string; title: string; due_at: string | null; status: "TODO" | "COMPLETE" };
type Document = { id: string; file_name: string; media_type: string; size_bytes: number; created_at: string };
type Workspace = { id: string; opportunity_id: string; opportunity_name: string; opportunity_type: string; deadline: string | null;
  status: "building" | "ready" | "submitted"; delivery_state: "PENDING" | "DELIVERED";
  application_workspace_tasks: Task[]; application_workspace_documents: Document[] };
type WorkspaceResponse = { workspaces?: Workspace[]; error?: string };
type ShareState = { workspace_id: string; consent_status: "active" | "revoked"; outcome_status: string | null };

async function fetchWorkspaces(): Promise<WorkspaceResponse> {
  const response = await fetch("/api/application-workspaces", { cache: "no-store" });
  const body = await response.json() as WorkspaceResponse;
  if (!response.ok) throw new Error(body.error || "Unable to load application workspaces.");
  return body;
}

type SharingResult = { available: true; shares: Record<string, ShareState> } | { available: false };

async function fetchMarketplaceShares(): Promise<SharingResult> {
  try {
    const result = await supabase.rpc("get_own_marketplace_application_shares");
    if (result.error) return { available: false };
    return { available: true, shares: Object.fromEntries(((result.data || []) as ShareState[]).map((row) => [row.workspace_id, row])) };
  } catch {
    return { available: false };
  }
}

export default function ApplicationWorkspaceDashboard() {
  const [access, setAccess] = useState<"checking" | "allowed" | "restricted">("checking");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]); const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Loading your application workspaces…"); const [error, setError] = useState<string | null>(null);
  const [opportunityId, setOpportunityId] = useState(""); const [name, setName] = useState("");
  const [type, setType] = useState("scholarship"); const [deadline, setDeadline] = useState("");
  const [shares, setShares] = useState<Record<string, ShareState>>({});
  const [consent, setConsent] = useState<Record<string, boolean>>({});
  const [sharingAvailable, setSharingAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { if (live) setAccess("restricted"); return; }
      const result = await supabase.from("profiles").select("role,profile_mode").eq("id", auth.user.id).maybeSingle();
      if (!live) return;
      try {
        const role = requirePlaybookRole(result.data?.profile_mode ?? result.data?.role);
        setAccess(["scholar", "scholar-athlete", "transition-youth"].includes(role) ? "allowed" : "restricted");
      } catch { setAccess("restricted"); }
    })();
    return () => { live = false; };
  }, []);

  useEffect(() => { if (access !== "allowed") return; const query = new URLSearchParams(window.location.search); const selectedId = query.get("opportunityId"); const selectedName = query.get("opportunityName");
    const selectedType = query.get("opportunityType"); const selectedDeadline = query.get("deadline"); const initialize = window.setTimeout(() => {
      if (selectedName) setName(selectedName); if (selectedId) setOpportunityId(selectedId); if (selectedDeadline && /^\d{4}-\d{2}-\d{2}$/.test(selectedDeadline)) setDeadline(selectedDeadline);
      if (selectedType && ["college", "scholarship", "internship", "job", "recruiting", "nil", "mentor", "mentorship", "sponsorship", "career", "summer_program", "competition", "grant", "volunteer", "research"].includes(selectedType)) setType(selectedType);
    }, 0);
    let active = true;
    void Promise.all([fetchWorkspaces(), fetchMarketplaceShares()]).then(([body, shareRows]) => { if (!active) return; setWorkspaces(body.workspaces ?? []); setShares(shareRows.available ? shareRows.shares : {}); setSharingAvailable(shareRows.available);
      setMessage((body.workspaces ?? []).length ? "Application workspaces loaded." : "No application workspace yet. Start with an opportunity below.");
    }).catch(value => { if (active) setError(value instanceof Error ? value.message : "Unable to load application workspaces."); });
    return () => { active = false; window.clearTimeout(initialize); }; }, [access]);

  async function refresh() { const [body, shareRows] = await Promise.all([fetchWorkspaces(), fetchMarketplaceShares()]); setWorkspaces(body.workspaces ?? []); setShares(shareRows.available ? shareRows.shares : {}); setSharingAvailable(shareRows.available);
    setMessage((body.workspaces ?? []).length ? "Application workspaces loaded." : "No application workspace yet. Start with an opportunity below."); }

  async function create(event: FormEvent) { event.preventDefault(); setBusy(true); setError(null); try {
    const response = await fetch("/api/application-workspaces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      opportunityId: opportunityId || "manual-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), opportunityName: name,
      opportunityType: type, deadline: deadline || null, requestId: crypto.randomUUID() }) });
    const body = await response.json() as { error?: string }; if (!response.ok) throw new Error(body.error || "Unable to create application workspace.");
    setName(""); setOpportunityId(""); setDeadline(""); await refresh(); setMessage("Application workspace created and connected to PBOS.");
  } catch (value) { setError(value instanceof Error ? value.message : "Unable to create application workspace."); } finally { setBusy(false); } }

  async function transition(workspaceId: string, action: string, taskId?: string) { setBusy(true); setError(null); try {
    const response = await fetch("/api/application-workspaces", { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, taskId, action, requestId: crypto.randomUUID() }) });
    const body = await response.json() as { error?: string }; if (!response.ok) throw new Error(body.error || "Unable to update application workspace.");
    await refresh(); setMessage(action === "APPLICATION_SUBMITTED" ? "Application marked submitted. Sharing with a Marketplace organization still requires your explicit consent below." : "Application task updated.");
  } catch (value) { setError(value instanceof Error ? value.message : "Unable to update application workspace."); } finally { setBusy(false); } }

  async function upload(workspaceId: string, file?: File) { if (!file) return; setBusy(true); setError(null); try {
    const data = new FormData(); data.set("workspaceId", workspaceId); data.set("file", file);
    const response = await fetch("/api/application-workspaces/documents", { method: "POST", body: data });
    const body = await response.json() as { error?: string }; if (!response.ok) throw new Error(body.error || "Unable to upload document.");
    await refresh(); setMessage("Private application document uploaded.");
  } catch (value) { setError(value instanceof Error ? value.message : "Unable to upload document."); } finally { setBusy(false); } }

  async function setMarketplaceShare(workspace: Workspace, share: boolean) {
    if (!sharingAvailable || (share && !consent[workspace.id])) return;
    setBusy(true); setError(null);
    try {
    const result = await supabase.rpc(share ? "share_marketplace_application" : "revoke_marketplace_application_share", { requested_workspace_id: workspace.id, ...(share ? { requested_consent_version: "marketplace-applicant-share-v1" } : {}) });
    if (result.error) { setError(result.error.message); setBusy(false); return; }
    setConsent(current => ({ ...current, [workspace.id]: false }));
    await refresh();
    setMessage(share
      ? "Applicant consent granted. The verified organization can now see a narrow application projection; your private documents and broader Scholar Record remain private."
      : "Applicant consent revoked. The organization can no longer see this application in its applicant workspace.");
    } catch { setError("Unable to update applicant sharing. Refresh sharing status and try again."); }
    finally { setBusy(false); }
  }

  if (access !== "allowed") return <PlaybookPage>
    <section style={{ maxWidth: 900, margin: "42px auto", padding: 28, background: "#FFFFFF", borderRadius: 20, color: "#0F172A" }} role={access === "restricted" ? "alert" : "status"}>
      <h1>{access === "checking" ? "Checking application workspace access…" : "Scholar-owned application workspaces"}</h1>
      <p>{access === "checking" ? "Confirming your registered role." : "These application workspaces belong to Scholar, Scholar-Athlete, and Transition-Aged Youth accounts. Brand Partners should review only applications explicitly shared through their Applicants dashboard."}</p>
      {access === "restricted" && <a href="/brand-partner-os/applicants">Return to Brand Partner Applicants</a>}
    </section>
  </PlaybookPage>;

  return <PlaybookPage>
    <PlaybookHero eyebrow="Application Workspace" title="Turn opportunity into action" subtitle="Track deadlines, tasks, private documents, status, and PBOS-governed progress in one durable workspace. Published Marketplace opportunity identity and deadline flow into this workspace without duplicate entry." />
    <div role="status" aria-live="polite" style={status}>{message}</div>{error && <div role="alert" aria-live="assertive" style={alert}>{error}</div>}
    {sharingAvailable === false && <div role="status" style={alert}>Applicant sharing is currently unavailable. Your application workspaces remain accessible. Sharing status could not be verified; existing access may still be active. <button disabled={busy} onClick={() => { setBusy(true); void refresh().catch(() => setError("Unable to refresh application workspaces.")).finally(() => setBusy(false)); }}>Retry sharing status</button></div>}
    <PlaybookCard eyebrow="New application" title="Start from an opportunity">
      <form onSubmit={create} aria-label="Create application workspace" style={form}>
        <label>Opportunity name<input required maxLength={160} value={name} onChange={event => setName(event.target.value)} /></label>
        <label>Opportunity type<select value={type} onChange={event => setType(event.target.value)}><option value="college">College</option><option value="scholarship">Scholarship</option><option value="internship">Internship</option><option value="job">Job</option><option value="sponsorship">Sponsorship</option><option value="nil">NIL</option><option value="mentorship">Mentorship</option><option value="recruiting">Recruiting</option><option value="mentor">Mentor</option><option value="career">Career</option><option value="summer_program">Summer program</option><option value="competition">Competition</option><option value="grant">Grant</option><option value="volunteer">Volunteer</option><option value="research">Research</option></select></label>
        <label>Deadline<input type="date" value={deadline} onChange={event => setDeadline(event.target.value)} /></label>
        <button disabled={busy} type="submit">{busy ? "Working…" : "Create application workspace"}</button>
      </form>
    </PlaybookCard>
    {workspaces.map(workspace => { const tasks = workspace.application_workspace_tasks ?? []; const completed = tasks.filter(task => task.status === "COMPLETE").length;
      const readiness = tasks.length ? Math.round(completed / tasks.length * 100) : 0; const share = shares[workspace.id]; return <section key={workspace.id} aria-labelledby={"workspace-" + workspace.id} style={section}>
        <h2 id={"workspace-" + workspace.id} style={{ color: "#0F172A" }}>{workspace.opportunity_name}</h2>
        <PlaybookMetrics><PlaybookMetric label="Readiness" value={String(readiness) + "%"} /><PlaybookMetric label="Tasks complete" value={String(completed) + "/" + String(tasks.length)} /><PlaybookMetric label="Deadline" value={workspace.deadline ?? "Not set"} /></PlaybookMetrics>
        <PlaybookGrid><PlaybookCard eyebrow="Tasks" title="Application checklist">{tasks.map(task => <label key={task.id} style={taskRow}>
          <input type="checkbox" checked={task.status === "COMPLETE"} disabled={busy || workspace.status === "submitted"} onChange={() => transition(workspace.id, task.status === "COMPLETE" ? "TASK_REOPENED" : "TASK_COMPLETED", task.id)} />{task.title}</label>)}</PlaybookCard>
          <PlaybookCard eyebrow="Private documents" title="Application packet"><label>Upload PDF, image, or DOCX<input type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" disabled={busy} onChange={event => upload(workspace.id, event.target.files?.[0])} /></label>
            {(workspace.application_workspace_documents ?? []).map(document => <p key={document.id}>📎 {document.file_name}</p>)}</PlaybookCard>
          <PlaybookCard eyebrow="Status" title="Submission readiness"><PlaybookPill>{workspace.status}</PlaybookPill><p>{workspace.delivery_state === "DELIVERED" ? "PBOS lifecycle connected" : "PBOS delivery pending"}</p>
            {workspace.status === "ready" && <button disabled={busy} onClick={() => transition(workspace.id, "APPLICATION_SUBMITTED")}>Mark application submitted</button>}</PlaybookCard>
          {workspace.status === "submitted" && <PlaybookCard eyebrow="Applicant Consent" title="Choose whether the organization can review this submission"><p style={privacyCopy}>Submission does not grant access by itself. If this workspace is linked to a published Marketplace listing, you may explicitly share a narrow applicant projection. Private uploaded documents and unrelated Scholar Record data stay private.</p>{!sharingAvailable ? <p>Sharing controls are unavailable until sharing status can be verified.</p> : share?.consent_status === "active" ? <><PlaybookPill>Shared · {share.outcome_status?.replaceAll("_"," ") || "submitted"}</PlaybookPill><button disabled={busy} onClick={() => void setMarketplaceShare(workspace,false)}>Revoke organization access</button></> : <><label><input type="checkbox" checked={Boolean(consent[workspace.id])} onChange={event => setConsent(current => ({ ...current, [workspace.id]: event.target.checked }))} />I consent to share my applicant identity and submission status with the organization for this opportunity. Private documents and other Scholar Record data are excluded.</label><button disabled={busy || !consent[workspace.id]} onClick={() => void setMarketplaceShare(workspace,true)}>Share submitted application with organization</button></>}</PlaybookCard>}
        </PlaybookGrid>
      </section>; })}
  <ApplicationSupportRequestPanel />
  </PlaybookPage>;
}

const form: React.CSSProperties = { display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", alignItems: "end" };
const section: React.CSSProperties = { marginTop: 28, padding: 20, border: "1px solid #CBD5E1", borderRadius: 18 };
const taskRow: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", padding: "8px 0" };
const status: React.CSSProperties = { padding: 12, margin: "12px 0", color: "#334155" };
const alert: React.CSSProperties = { padding: 12, margin: "12px 0", border: "1px solid #B91C1C", borderRadius: 10, color: "#B91C1C" };
const privacyCopy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
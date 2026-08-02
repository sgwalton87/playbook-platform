"use client";

import { useState } from "react";
import { PlaybookButton } from "@/components/ui/PlaybookButton";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill, PlaybookSurfaceState } from "@/components/ui";

type Requirement = { id: string; label: string; required: boolean; completed: boolean };
type Workspace = { id: string; opportunity_name: string; opportunity_type: string; deadline: string | null; requirements: Requirement[]; evidence: string[]; status: string; created_at: string };
function readiness(workspace: Workspace) { const required = (workspace.requirements || []).filter((item) => item.required); return required.length ? Math.round(required.filter((item) => item.completed).length / required.length * 100) : 0; }

export default function ApplicationWorkspaceDashboard({ scholarId, initialWorkspaces, canCreate }: { scholarId: string; initialWorkspaces: Workspace[]; canCreate: boolean }) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [name, setName] = useState("");
  const [type, setType] = useState("internship");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createWorkspace() {
    setSaving(true); setError("");
    const response = await fetch("/api/application-workspaces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scholarId, opportunityName: name, opportunityType: type, deadline: deadline || null, requirements: [], evidence: [] }) });
    const body = await response.json(); setSaving(false);
    if (!response.ok) { setError(body.error || "Workspace could not be created."); return; }
    setWorkspaces((current) => [body.workspace, ...current]); setName(""); setDeadline("");
  }

  const active = workspaces.filter((workspace) => workspace.status !== "submitted");
  return <PlaybookPage>
    <PlaybookHero eyebrow="Application Workspace" title="Turn opportunities into governed plans" subtitle="Live workspaces connect deadlines, requirements, evidence, recommendations, portfolio materials, and submission readiness." />
    <PlaybookMetrics><PlaybookMetric label="Workspaces" value={String(workspaces.length)} /><PlaybookMetric label="Active" value={String(active.length)} /><PlaybookMetric label="Next deadline" value={active.map((item) => item.deadline).filter(Boolean).sort()[0] || "Not set"} /></PlaybookMetrics>
    {canCreate && <PlaybookCard eyebrow="Create" title="Start an application workspace"><div style={{ display: "grid", gap: 12 }}><label>Opportunity name<input value={name} onChange={(event) => setName(event.target.value)} className="playbook-input" /></label><label>Opportunity type<select value={type} onChange={(event) => setType(event.target.value)} className="playbook-input"><option value="internship">Internship</option><option value="college">College</option><option value="scholarship">Scholarship</option><option value="job">Job</option><option value="program">Program</option></select></label><label>Deadline<input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="playbook-input" /></label><PlaybookButton onClick={createWorkspace}>{saving ? "Creating…" : "Create workspace"}</PlaybookButton>{error && <p role="alert">{error}</p>}</div></PlaybookCard>}
    {workspaces.length === 0 ? <PlaybookSurfaceState state="empty" title="No application workspaces" description={canCreate ? "Start with a real opportunity and add requirements as they become known." : "This Scholar has not created an application workspace."} action={{ href: "/opportunities", label: "Review opportunities" }} /> : <PlaybookGrid min={300}>{workspaces.map((workspace) => <PlaybookCard key={workspace.id} eyebrow={workspace.opportunity_type} title={workspace.opportunity_name}><p><strong>Deadline:</strong> {workspace.deadline ? new Date(workspace.deadline).toLocaleDateString() : "Not set"}</p><p><strong>Requirements:</strong> {(workspace.requirements || []).length} · <strong>Evidence:</strong> {(workspace.evidence || []).length}</p><p><strong>Readiness:</strong> {readiness(workspace)}%</p><PlaybookPill>{workspace.status}</PlaybookPill></PlaybookCard>)}</PlaybookGrid>}
  </PlaybookPage>;
}

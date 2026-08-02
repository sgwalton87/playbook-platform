"use client";

import { useEffect, useState } from "react";
import { PlaybookButton } from "@/components/ui/PlaybookButton";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookPage, PlaybookPill, PlaybookSurfaceState } from "@/components/ui";

type HandoffStatus = "assigned" | "accepted" | "in_progress" | "completed" | "declined" | "cancelled";
type Handoff = {
  id: string;
  action_type: string;
  title: string;
  detail: string | null;
  source_type: string;
  required_permission: string;
  status: HandoffStatus;
  assigned_to: string;
  created_by: string;
  due_at: string | null;
  created_at: string;
};

const transitions: Partial<Record<HandoffStatus, Array<"accepted" | "in_progress" | "completed" | "declined">>> = {
  assigned: ["accepted", "declined"],
  accepted: ["in_progress", "declined"],
  in_progress: ["completed"],
};

export default function ActionRoutingCenter() {
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/action-routing", { cache: "no-store" });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(body.error || "Action handoffs are unavailable.");
      return;
    }
    setHandoffs(body.handoffs || []);
  }

  useEffect(() => {
    void fetch("/api/action-routing", { cache: "no-store" })
      .then(async (response) => ({ response, body: await response.json() }))
      .then(({ response, body }) => {
        setLoading(false);
        if (!response.ok) {
          setError(body.error || "Action handoffs are unavailable.");
          return;
        }
        setHandoffs(body.handoffs || []);
      });
  }, []);

  async function transition(handoffId: string, status: "accepted" | "in_progress" | "completed" | "declined") {
    setUpdating(handoffId);
    setError("");
    const response = await fetch("/api/action-routing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handoffId, status }),
    });
    const body = await response.json();
    setUpdating(null);
    if (!response.ok) {
      setError(body.error || "The handoff could not be updated.");
      return;
    }
    await load();
  }

  return <PlaybookPage>
    <PlaybookHero eyebrow="Role OS Action Routing" title="Governed support handoffs" subtitle="Interventions, recommendations, evidence reviews, and opportunity support move through persisted role assignments with explicit permission and lifecycle state." />
    {error && <PlaybookSurfaceState state="error" title="Action routing needs attention" description={error} action={<PlaybookButton onClick={load}>Try again</PlaybookButton>} />}
    {loading ? <PlaybookSurfaceState state="loading" description="Loading authorized handoffs." /> : handoffs.length === 0 ? <PlaybookSurfaceState state="empty" title="No open handoffs" description="No governed action has been assigned to or created by this account." action={{ href: "/support-network", label: "Review support relationships" }} /> :
      <PlaybookGrid min={300}>{handoffs.map((handoff) => <PlaybookCard key={handoff.id} eyebrow={handoff.action_type} title={handoff.title}>
        <p>{handoff.detail || "No additional detail supplied."}</p>
        <p><strong>Source:</strong> {handoff.source_type} · <strong>Permission:</strong> {handoff.required_permission.replaceAll("_", " ")}</p>
        {handoff.due_at && <p><strong>Due:</strong> {new Date(handoff.due_at).toLocaleDateString()}</p>}
        <PlaybookPill>{handoff.status.replaceAll("_", " ")}</PlaybookPill>
        {(transitions[handoff.status] || []).length > 0 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>{transitions[handoff.status]?.map((status) => <PlaybookButton key={status} variant={status === "declined" ? "secondary" : "primary"} onClick={() => transition(handoff.id, status)}>{updating === handoff.id ? "Saving…" : status.replaceAll("_", " ")}</PlaybookButton>)}</div>}
      </PlaybookCard>)}</PlaybookGrid>}
  </PlaybookPage>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ProjectStatus =
  | "not_started"
  | "in_progress"
  | "testing"
  | "complete"
  | "needs_fix";

type FounderTask = {
  id: string;
  phaseId: string;
  title: string;
  status: ProjectStatus;
  owner?: string;
  notes?: string;
  completedAt?: string | null;
};

type FounderPhase = {
  id: string;
  number: number;
  title: string;
  status: ProjectStatus;
  completionPercent: number;
};

type FounderEvent = {
  id: string;
  type: string;
  title: string;
  description: string;
  actor: string;
  createdAt: string;
};

type FounderBug = {
  id: string;
  title: string;
  status: "open" | "resolved";
  severity: "low" | "medium" | "high" | "critical";
  notes?: string;
};

type FounderProject = {
  version: number;
  projectName: string;
  founder: string;
  updatedAt: string;
  overallCompletionPercent: number;
  currentPhaseId: string;
  currentTaskId: string | null;
  phases: FounderPhase[];
  tasks: FounderTask[];
  events: FounderEvent[];
  bugs: FounderBug[];
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  testing: "Testing",
  complete: "Complete",
  needs_fix: "Needs Fix",
};

const STATUS_ICONS: Record<ProjectStatus, string> = {
  not_started: "⬜",
  in_progress: "🟨",
  testing: "🟦",
  complete: "🟩",
  needs_fix: "🟥",
};

export default function FounderProjectIntelligencePage() {
  const [project, setProject] = useState<FounderProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

  async function loadProject() {
    setLoading(true);

    const response = await fetch("/api/founder/project", {
      cache: "no-store",
    });

    const payload = await response.json();

    if (!response.ok) {
      console.error(payload.error);
      setLoading(false);
      return;
    }

    setProject(payload.project);

    if (!selectedPhaseId) {
      setSelectedPhaseId(
        payload.project.currentPhaseId ||
          payload.project.phases?.[0]?.id ||
          null
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProject();
  }, []);

  const selectedPhase = useMemo(
    () =>
      project?.phases.find(
        (phase) => phase.id === selectedPhaseId
      ) || null,
    [project, selectedPhaseId]
  );

  const selectedTasks = useMemo(
    () =>
      project?.tasks.filter(
        (task) => task.phaseId === selectedPhaseId
      ) || [],
    [project, selectedPhaseId]
  );

  const openBugs = useMemo(
    () =>
      project?.bugs.filter(
        (bug) => bug.status === "open"
      ) || [],
    [project]
  );

  const recentEvents = useMemo(
    () =>
      [...(project?.events || [])]
        .reverse()
        .slice(0, 8),
    [project]
  );

  const taskCounts = useMemo(() => {
    const tasks = project?.tasks || [];

    return {
      complete: tasks.filter(
        (task) => task.status === "complete"
      ).length,
      testing: tasks.filter(
        (task) => task.status === "testing"
      ).length,
      needsFix: tasks.filter(
        (task) => task.status === "needs_fix"
      ).length,
      remaining: tasks.filter(
        (task) =>
          task.status === "not_started" ||
          task.status === "in_progress"
      ).length,
    };
  }, [project]);

  if (loading) {
    return (
      <main style={loadingPage}>
        Loading Founder Project Intelligence...
      </main>
    );
  }

  if (!project) {
    return (
      <main style={loadingPage}>
        Founder Knowledge Base could not be loaded.
      </main>
    );
  }

  return (
    <main style={page}>
      <section style={hero}>
        <div>
          <p style={eyebrow}>Founder Project Intelligence</p>

          <h1 style={title}>Playbook Control Tower</h1>

          <p style={lead}>
            One source of truth for platform completion,
            systems health, testing, bugs, architecture,
            releases, and launch readiness.
          </p>
        </div>

        <div style={readinessCard}>
          <span style={readinessNumber}>
            {project.overallCompletionPercent}%
          </span>

          <span style={readinessLabel}>
            Overall completion
          </span>

          <div style={progressTrack}>
            <div
              style={{
                ...progressFill,
                width: `${project.overallCompletionPercent}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section style={metricGrid}>
        <Metric
          label="Completed Tasks"
          value={String(taskCounts.complete)}
          detail={`${project.tasks.length} total tasks`}
        />

        <Metric
          label="Testing"
          value={String(taskCounts.testing)}
          detail="Awaiting final validation"
        />

        <Metric
          label="Needs Fix"
          value={String(taskCounts.needsFix)}
          detail="Requires attention"
        />

        <Metric
          label="Open Bugs"
          value={String(openBugs.length)}
          detail="Tracked in Founder KB"
        />
      </section>

      <section style={contentGrid}>
        <article style={panel}>
          <div style={panelHeader}>
            <div>
              <p style={eyebrow}>15-Phase Roadmap</p>
              <h2 style={panelTitle}>System Readiness</h2>
            </div>

            <button onClick={loadProject} style={refreshButton}>
              Refresh
            </button>
          </div>

          <div style={phaseList}>
            {project.phases.map((phase) => (
              <button
                key={phase.id}
                onClick={() =>
                  setSelectedPhaseId(phase.id)
                }
                style={{
                  ...phaseRow,
                  ...(selectedPhaseId === phase.id
                    ? activePhaseRow
                    : {}),
                }}
              >
                <div style={phaseIdentity}>
                  <span style={phaseNumber}>
                    {phase.number}
                  </span>

                  <div>
                    <strong>{phase.title}</strong>
                    <div style={phaseStatus}>
                      {STATUS_ICONS[phase.status]}{" "}
                      {STATUS_LABELS[phase.status]}
                    </div>
                  </div>
                </div>

                <div style={phaseProgressArea}>
                  <strong>{phase.completionPercent}%</strong>

                  <div style={smallTrack}>
                    <div
                      style={{
                        ...smallFill,
                        width: `${phase.completionPercent}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </article>

        <article style={panel}>
          <p style={eyebrow}>
            Selected Phase
          </p>

          <h2 style={panelTitle}>
            {selectedPhase
              ? `Phase ${selectedPhase.number}: ${selectedPhase.title}`
              : "Choose a phase"}
          </h2>

          <div style={taskList}>
            {selectedTasks.map((task) => (
              <div key={task.id} style={taskRow}>
                <div style={taskText}>
                  <span>
                    {STATUS_ICONS[task.status]}
                  </span>

                  <div>
                    <strong>{task.title}</strong>

                    <div style={taskStatus}>
                      {STATUS_LABELS[task.status]}
                      {task.owner
                        ? ` · ${task.owner}`
                        : ""}
                    </div>

                    {task.notes && (
                      <p style={taskNotes}>
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                <code style={taskCode}>
                  {task.id}
                </code>
              </div>
            ))}

            {selectedTasks.length === 0 && (
              <p style={emptyText}>
                No tasks found for this phase.
              </p>
            )}
          </div>
        </article>
      </section>

      <section style={lowerGrid}>
        <article style={panel}>
          <p style={eyebrow}>Recent Activity</p>
          <h2 style={panelTitle}>Founder Journal Feed</h2>

          <div style={eventList}>
            {recentEvents.map((event) => (
              <div key={event.id} style={eventRow}>
                <div style={eventDot} />

                <div>
                  <strong>{event.title}</strong>

                  <p style={eventDescription}>
                    {event.description}
                  </p>

                  <small style={eventMeta}>
                    {new Date(
                      event.createdAt
                    ).toLocaleString()}{" "}
                    · {event.actor}
                  </small>
                </div>
              </div>
            ))}

            {recentEvents.length === 0 && (
              <p style={emptyText}>
                No Founder Knowledge Base events yet.
              </p>
            )}
          </div>
        </article>

        <article style={panel}>
          <p style={eyebrow}>Risk & Quality</p>
          <h2 style={panelTitle}>Open Bugs</h2>

          <div style={bugList}>
            {openBugs.map((bug) => (
              <div key={bug.id} style={bugRow}>
                <span style={severityBadge}>
                  {bug.severity}
                </span>

                <div>
                  <strong>{bug.title}</strong>

                  {bug.notes && (
                    <p style={taskNotes}>
                      {bug.notes}
                    </p>
                  )}

                  <code style={taskCode}>
                    {bug.id}
                  </code>
                </div>
              </div>
            ))}

            {openBugs.length === 0 && (
              <p style={emptyText}>
                No open bugs recorded.
              </p>
            )}
          </div>

          <div style={docLinks}>
            <Link
              href="/studio/docs"
              style={primaryLink}
            >
              Documentation Center
            </Link>

            <Link
              href="/studio/architecture"
              style={secondaryLink}
            >
              Architecture Viewer
            </Link>
          </div>
        </article>
      </section>

      <section style={commandPanel}>
        <p style={eyebrow}>Founder CLI</p>
        <h2 style={panelTitle}>
          Update Project Intelligence
        </h2>

        <p style={commandDescription}>
          Complete tasks only after the system passes its
          Definition of Done.
        </p>

        <pre style={command}>
{`npm run founder:list

node scripts/founder/update.mjs set-status \\
  <task-id> \\
  --status=testing \\
  --notes="Describe what remains"

node scripts/founder/update.mjs complete-task \\
  <task-id> \\
  --notes="Describe validation completed" \\
  --files="app/example/page.tsx,lib/example.ts"

npm run founder:docs`}
        </pre>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article style={metricCard}>
      <p style={eyebrow}>{label}</p>
      <strong style={metricValue}>{value}</strong>
      <p style={metricDetail}>{detail}</p>
    </article>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F8F7F4",
  color: "#0F172A",
  padding: 24,
};

const loadingPage: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "#F8F7F4",
  color: "#64748B",
  fontWeight: 900,
};

const hero: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0,1.5fr) minmax(260px,.5fr)",
  gap: 24,
  alignItems: "center",
  background: "#0F172A",
  color: "#F8F7F4",
  borderRadius: 32,
  padding: "clamp(32px,5vw,68px)",
  marginBottom: 18,
};

const eyebrow: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: "#F97316",
  fontWeight: 900,
  margin: "0 0 8px",
};

const title: React.CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  fontSize: "clamp(48px,7vw,86px)",
  lineHeight: 0.92,
  textTransform: "uppercase",
  margin: "10px 0 16px",
};

const lead: React.CSSProperties = {
  maxWidth: 820,
  fontSize: 20,
  lineHeight: 1.5,
  color: "rgba(248,247,244,.74)",
  margin: 0,
};

const readinessCard: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(255,255,255,.07)",
  borderRadius: 26,
  padding: 24,
};

const readinessNumber: React.CSSProperties = {
  display: "block",
  fontFamily: "'Anton', sans-serif",
  fontSize: 72,
  lineHeight: 1,
};

const readinessLabel: React.CSSProperties = {
  color: "rgba(248,247,244,.68)",
  fontWeight: 800,
};

const progressTrack: React.CSSProperties = {
  height: 12,
  background: "rgba(255,255,255,.12)",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 18,
};

const progressFill: React.CSSProperties = {
  height: "100%",
  background: "#F97316",
  borderRadius: 999,
};

const metricGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(200px,1fr))",
  gap: 14,
  marginBottom: 18,
};

const metricCard: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 22,
  padding: 22,
};

const metricValue: React.CSSProperties = {
  display: "block",
  fontFamily: "'Anton', sans-serif",
  fontSize: 42,
  lineHeight: 1,
};

const metricDetail: React.CSSProperties = {
  color: "#64748B",
  margin: "8px 0 0",
};

const contentGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(320px,.85fr) minmax(0,1.15fr)",
  gap: 18,
  alignItems: "start",
};

const lowerGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(320px,1fr))",
  gap: 18,
  marginTop: 18,
};

const panel: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 26,
  padding: 24,
};

const panelHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const panelTitle: React.CSSProperties = {
  margin: "4px 0 18px",
  fontSize: 26,
};

const refreshButton: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  color: "#0F172A",
  borderRadius: 999,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const phaseList: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const phaseRow: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  textAlign: "left",
  border: "1px solid #E2E8F0",
  background: "#F8FAFC",
  borderRadius: 16,
  padding: 14,
  cursor: "pointer",
};

const activePhaseRow: React.CSSProperties = {
  borderColor: "#F97316",
  background: "#FFF7ED",
};

const phaseIdentity: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const phaseNumber: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: "#0F172A",
  color: "#FFFFFF",
  fontWeight: 950,
};

const phaseStatus: React.CSSProperties = {
  color: "#64748B",
  fontSize: 12,
  marginTop: 3,
};

const phaseProgressArea: React.CSSProperties = {
  width: 100,
  textAlign: "right",
};

const smallTrack: React.CSSProperties = {
  height: 6,
  borderRadius: 999,
  overflow: "hidden",
  background: "#E2E8F0",
  marginTop: 5,
};

const smallFill: React.CSSProperties = {
  height: "100%",
  background: "#F97316",
};

const taskList: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const taskRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: 14,
};

const taskText: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const taskStatus: React.CSSProperties = {
  color: "#64748B",
  fontSize: 12,
  marginTop: 3,
};

const taskNotes: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.45,
  margin: "7px 0 0",
};

const taskCode: React.CSSProperties = {
  fontSize: 10,
  color: "#64748B",
  overflowWrap: "anywhere",
};

const eventList: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const eventRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "12px 1fr",
  gap: 12,
};

const eventDot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "#F97316",
  marginTop: 6,
};

const eventDescription: React.CSSProperties = {
  color: "#64748B",
  margin: "5px 0",
  lineHeight: 1.45,
};

const eventMeta: React.CSSProperties = {
  color: "#94A3B8",
};

const bugList: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const bugRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: 12,
  border: "1px solid #FECACA",
  background: "#FEF2F2",
  borderRadius: 16,
  padding: 14,
};

const severityBadge: React.CSSProperties = {
  alignSelf: "start",
  borderRadius: 999,
  background: "#DC2626",
  color: "#FFFFFF",
  padding: "5px 9px",
  fontSize: 9,
  textTransform: "uppercase",
  fontWeight: 950,
};

const docLinks: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 20,
};

const primaryLink: React.CSSProperties = {
  borderRadius: 999,
  background: "#F97316",
  color: "#FFFFFF",
  padding: "11px 16px",
  textDecoration: "none",
  fontWeight: 950,
};

const secondaryLink: React.CSSProperties = {
  borderRadius: 999,
  background: "#FFFFFF",
  color: "#0F172A",
  border: "1px solid #CBD5E1",
  padding: "11px 16px",
  textDecoration: "none",
  fontWeight: 950,
};

const commandPanel: React.CSSProperties = {
  marginTop: 18,
  borderRadius: 26,
  background: "#0F172A",
  color: "#F8F7F4",
  padding: 24,
};

const commandDescription: React.CSSProperties = {
  color: "rgba(248,247,244,.68)",
};

const command: React.CSSProperties = {
  whiteSpace: "pre-wrap",
  overflowX: "auto",
  background: "#020617",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 16,
  padding: 18,
  lineHeight: 1.55,
};

const emptyText: React.CSSProperties = {
  color: "#64748B",
};

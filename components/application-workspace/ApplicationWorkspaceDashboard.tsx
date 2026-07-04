"use client";

import {
  buildApplicationWorkspace,
  buildApplicationWorkspaceRecommendations,
  getMissingApplicationRequirements,
} from "@/lib/application-workspace";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function ApplicationWorkspaceDashboard() {
  const workspace = buildApplicationWorkspace({
    scholarId: "scholar-maya",
    opportunityName: "Health Careers Internship",
    opportunityType: "internship",
    deadline: "2026-09-01",
    evidence: ["Biology reflection", "Resume draft"],
    requirements: [
      { id: "resume", label: "Resume", required: true, completed: true },
      { id: "letter", label: "Recommendation Letter", required: true, completed: false },
      { id: "brag", label: "Brag Sheet", required: true, completed: true },
      { id: "essay", label: "Short Essay", required: true, completed: false },
    ],
  });

  const missing = getMissingApplicationRequirements(workspace);
  const recommendations = buildApplicationWorkspaceRecommendations(workspace);

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Application Workspace"
        title={workspace.opportunity_name}
        subtitle="A focused workspace for deadlines, requirements, evidence, recommendations, portfolio materials, and submission readiness."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Readiness" value={`${workspace.readiness}%`} />
        <PlaybookMetric label="Missing" value={String(missing.length)} />
        <PlaybookMetric label="Status" value={workspace.status} />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Requirements" title="Application checklist">
          {workspace.requirements.map((item) => (
            <p key={item.id} style={body}>
              {item.completed ? "✓" : "○"} {item.label}
            </p>
          ))}
        </PlaybookCard>

        <PlaybookCard eyebrow="Recommendations" title="Next best actions">
          {recommendations.map((item) => (
            <p key={item} style={body}>✓ {item}</p>
          ))}
          <PlaybookPill>{workspace.status}</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Evidence" title="Attached materials">
          {workspace.evidence.map((item) => (
            <p key={item} style={body}>📎 {item}</p>
          ))}
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

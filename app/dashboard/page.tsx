"use client";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function DashboardPage() {
  const nextActions = [
    { title: "Complete your Scholar Record", href: "/record", status: "active" },
    { title: "Check unread support messages", href: "/messages", status: "active" },
    { title: "Review application workspace", href: "/application-workspaces", status: "foundation" },
    { title: "Open your reward economy", href: "/reward-economy", status: "foundation" },
  ];

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Dashboard"
        title="Your active Playbook command center."
        subtitle="Start here for next actions, messages, support-network signals, applications, rewards, and Scholar Record progress."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/messages">Open Inbox</PlaybookButton>
          <PlaybookButton href="/notifications" variant="secondary">Notifications</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookMetrics>
        <PlaybookMetric label="Network Health" value="86%" />
        <PlaybookMetric label="Unread Signals" value="5" />
        <PlaybookMetric label="Open Actions" value="4" />
        <PlaybookMetric label="Coins" value="315" />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Next Actions" title="What to do now">
          {nextActions.map((action) => (
            <div key={action.title} style={actionRow}>
              <div>
                <strong>{action.title}</strong>
                <div style={{ marginTop: 6 }}>
                  <PlaybookPill>{action.status}</PlaybookPill>
                </div>
              </div>
              <PlaybookButton href={action.href}>Open</PlaybookButton>
            </div>
          ))}
        </PlaybookCard>

        <PlaybookCard eyebrow="Scholar Network" title="Your support system is connected">
          <p style={body}>Messages, shared actions, invitations, recommendations, and application support now connect through one ecosystem.</p>
          <PlaybookButton href="/scholar-network">View Network</PlaybookButton>
        </PlaybookCard>

        <PlaybookCard eyebrow="Applications" title="Turn your record into opportunity">
          <p style={body}>Build resumes, brag sheets, recommendations, portfolio packets, PDFs, and workspace checklists.</p>
          <PlaybookButton href="/opportunity-toolkit">Open Toolkit</PlaybookButton>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

const actionRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: 14,
  marginBottom: 10,
  color: "#0F172A",
};

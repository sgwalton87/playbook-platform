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

const founderCapabilities = [
  { label: "Project Intelligence", title: "See what Playbook is actually building", body: "Use Studio and PBOS audit evidence to inspect canonical capabilities, dependencies, route truth, and release readiness without relying on stale tracker percentages.", href: "/studio", action: "Open Project Intelligence", owner: "PBOS + Studio" },
  { label: "Analytics", title: "Measure platform outcomes and adoption", body: "Open the shared Analytics surface for platform-level measurement. Founder reporting consumes shared analytics rather than creating a private telemetry system.", href: "/analytics", action: "Open Analytics", owner: "Analytics service" },
  { label: "User Management", title: "Govern people through platform authority", body: "User administration stays behind platform-operator authorization. Identity, role evidence, permissions, and relationships remain owned by their canonical services.", href: "/admin", action: "Open Admin Center", owner: "Identity + Admin" },
  { label: "Verification", title: "Review evidence with human authority", body: "Operate the canonical verification queue for role evidence and Marketplace publication boundaries. Decisions require explicit human review and recorded reasons.", href: "/admin", action: "Open Verification Review", owner: "Verification service" },
  { label: "Moderation", title: "Protect community trust", body: "Use the shared moderation workflow for reports and safety actions so Feed, Messaging, and Network do not invent separate enforcement systems.", href: "/admin/moderation", action: "Open Moderation", owner: "Moderation service" },
  { label: "Feature Flags", title: "Inspect capability readiness before exposure", body: "Feature exposure is treated as governed release configuration. Studio is the current inspection surface; no user-facing feature is represented as enabled without release evidence.", href: "/studio", action: "Inspect Feature Readiness", owner: "Release governance" },
  { label: "Bug Tracking", title: "Turn defects into release evidence", body: "The Founder audit surface consolidates known defects, wiring gaps, and acceptance evidence instead of creating an unrelated bug database inside the UI.", href: "/studio/beta-34-audit", action: "Open Audit", owner: "PBOS audit control" },
  { label: "Release Management", title: "Ship only certified immutable heads", body: "Release management follows the same exact-head CI, database certification, PBOS audit, and production-build gates used throughout the platform build.", href: "/studio", action: "Open Release Workspace", owner: "PBOS release governance" },
  { label: "Architecture Viewer", title: "Inspect one platform architecture", body: "Use Studio to inspect canonical operating systems, shared services, capability ownership, and dependency boundaries. Architecture remains documentation-backed and versioned.", href: "/studio", action: "View Architecture", owner: "Architecture + PBOS" },
  { label: "Documentation Center", title: "Keep institutional memory connected", body: "Canonical specifications, architecture, release evidence, and historical records stay versioned in the repository. Founder tooling points to that source rather than copying documentation into a second store.", href: "/studio", action: "Open Documentation Workspace", owner: "Repository governance" },
  { label: "Content Review", title: "Review platform content before trust is granted", body: "Content review composes moderation and governed publication workflows. Founder authority does not bypass role ownership, privacy, or human review requirements.", href: "/admin/moderation", action: "Open Content Review", owner: "Moderation + publication" },
  { label: "System Health", title: "Inspect release and operational health", body: "Use the audit and analytics surfaces for observable system status. Founder metrics must be based on real health evidence rather than hard-coded green states.", href: "/studio/beta-34-audit", action: "Open System Health", owner: "Observability + PBOS" },
] as const;

export default function FounderPage() {
  return (
    <PlaybookPage>
      <div data-testid="founder-command-center" data-phase-14-capabilities={founderCapabilities.length}>
        <PlaybookHero
          eyebrow="Founder Command Center"
          title="Build, inspect, govern, and ship one Playbook Platform."
          subtitle="A platform-operator workspace that composes PBOS, Studio, Analytics, Verification, Moderation, and release evidence without creating shadow sources of truth."
        >
          <div style={heroActions}>
            <PlaybookButton href="/founder/qa">Platform QA Gates</PlaybookButton>
            <PlaybookButton href="/studio" variant="secondary">Open Studio</PlaybookButton>
            <PlaybookButton href="/studio/beta-34-audit" variant="secondary">Open Platform Audit</PlaybookButton>
            <PlaybookButton href="/admin" variant="secondary">Open Admin Center</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={governancePanel}>
          <PlaybookPill>Platform operator authority</PlaybookPill>
          <h2 style={governanceTitle}>Founder visibility does not create founder-owned copies of platform data.</h2>
          <p style={governanceCopy}>Every metric, review, release decision, architecture view, and operational signal must resolve to its canonical service or repository evidence. This command center is a governed lens over those owners.</p>
        </section>

        <PlaybookMetrics>
          <PlaybookMetric label="Founder capabilities" value={String(founderCapabilities.length)} />
          <PlaybookMetric label="Operator boundary" value="Server enforced" />
          <PlaybookMetric label="Canonical ownership" value="Shared services" />
          <PlaybookMetric label="Release truth" value="Exact-head evidence" />
        </PlaybookMetrics>

        <PlaybookGrid min={300}>
          {founderCapabilities.map((capability) => (
            <PlaybookCard key={capability.label} eyebrow={capability.label} title={capability.title}>
              <PlaybookPill>{capability.owner}</PlaybookPill>
              <p style={body}>{capability.body}</p>
              <PlaybookButton href={capability.href}>{capability.action}</PlaybookButton>
            </PlaybookCard>
          ))}
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}

const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 };
const governancePanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const governanceTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const governanceCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.65 };
const body: React.CSSProperties = { color: "#52657B", lineHeight: 1.65, margin: "14px 0 20px" };

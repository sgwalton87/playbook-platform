"use client";

import { getStudioStatus } from "@/lib/studio/studioStatus";
import StudioCard from "./StudioCard";
import StudioHeader from "./StudioHeader";
import StudioQuickActions from "./StudioQuickActions";

export default function StudioDashboard() {
  const status = getStudioStatus();

  return (
    <main style={main}>
      <StudioHeader status={status} />

      <section style={grid}>
        <StudioCard label="Version" title="Current OS" value={status.version} />
        <StudioCard label="Stage" title="Build Stage" value={status.stage} />
        <StudioCard label="Alpha" title="Foundation" value={status.alphaStatus} />
        <StudioCard label="Beta" title="Current Focus" value={status.betaStatus} />
      </section>

      <section id="health" style={grid}>
        <StudioCard label="Tests" title="Test Suite" value={status.tests} />
        <StudioCard label="Build" title="Production Build" value={status.build} />
        <StudioCard label="Sentinel" title="System Health" value={status.sentinel} />
        <StudioCard label="SDK" title="Playbook SDK" value={status.sdk} />
        <StudioCard label="Event Bus" title="Platform Events" value={status.eventBus} />
        <StudioCard label="Docs" title="Documentation" value={status.documentation} />
      </section>

      <section id="architecture" style={grid2}>
        <StudioCard label="Architecture" title="Current Map" value={status.architecture}>
          <p style={body}>Cartographer maps what exists. Sentinel checks health. Doc Governor manages documentation.</p>
        </StudioCard>

        <StudioCard label="Latest Sprint" title={status.latestSprint}>
          <p style={body}>The Living Scholar Experience and Demo Mode are now presentation-ready foundations.</p>
        </StudioCard>
      </section>

      <section id="documentation" style={grid2}>
        <StudioCard label="Quick Actions" title="Open product surfaces">
          <StudioQuickActions />
        </StudioCard>

        <StudioCard label="Release" title="Latest Release" value={status.latestRelease}>
          <p style={body}>Use the Unified Ledger to record milestones, architecture, demos, products, and releases.</p>
        </StudioCard>
      </section>
    </main>
  );
}

const main: React.CSSProperties = {
  padding: 30,
  background: "#F8F7F4",
  minHeight: "100vh",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 18,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
  gap: 16,
  marginBottom: 18,
};

const body: React.CSSProperties = {
  color: "#64748B",
  fontSize: 14,
  lineHeight: 1.6,
};

"use client";

import { useRouter } from "next/navigation";
import {
  CORE_JOURNEY,
  type CoreJourneyStatus,
  calculateJourneyProgress,
} from "@/lib/core-journey";

type Props = {
  statuses?: Record<string, CoreJourneyStatus>;
};

export default function CoreJourneyDashboard({
  statuses = {},
}: Props) {
  const router = useRouter();
  const progress = calculateJourneyProgress(statuses);

  return (
    <main style={page}>
      <section style={hero}>
        <div style={eyebrow}>YOUR PLAYBOOK</div>

        <h1 style={title}>
          Know where you are.
          <br />
          Know what comes next.
        </h1>

        <p style={subtitle}>
          Playbook connects your academic record, eligibility, opportunities,
          applications, supporters, learning, and rewards into one journey.
        </p>

        <div style={progressCard}>
          <div>
            <div style={progressLabel}>Journey Progress</div>
            <div style={progressValue}>{progress.percent}%</div>
          </div>

          <div style={progressTrack}>
            <div
              style={{
                ...progressFill,
                width: `${progress.percent}%`,
              }}
            />
          </div>

          <div style={progressMeta}>
            {progress.completed} of {progress.total} readiness stages complete
          </div>
        </div>
      </section>

      <section style={content}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrowDark}>START HERE</div>
            <h2 style={sectionTitle}>Your path through Playbook</h2>
          </div>

          <button
            onClick={() => router.push("/transcript")}
            style={primaryButton}
          >
            Upload Transcript →
          </button>
        </div>

        <div style={journeyGrid}>
          {CORE_JOURNEY.map((step) => {
            const status = statuses[step.id] || "not_started";

            return (
              <button
                key={step.id}
                onClick={() => router.push(step.href)}
                style={journeyCard}
              >
                <div style={cardTop}>
                  <div style={number}>{step.order}</div>
                  <div style={{ ...statusPill, ...getStatusColor(status) }}>{formatStatus(status)}</div>
                </div>

                <div style={stepIcon}>{step.icon}</div>
                <h3 style={cardTitle}>{step.label}</h3>
                <p style={cardBody}>{step.description}</p>

                <div style={openText}>Open workspace →</div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function formatStatus(status: CoreJourneyStatus) {
  return status.replaceAll("_", " ");
}

function getStatusColor(status: CoreJourneyStatus) {
  if (status === "complete" || status === "ready") {
    return { background: "#ECFDF5", color: "#047857" };
  }

  if (status === "in_progress") {
    return { background: "#FFFBEB", color: "#B45309" };
  }

  if (status === "needs_attention") {
    return { background: "#FEF2F2", color: "#B91C1C" };
  }

  return { background: "#F1F5F9", color: "#64748B" };
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F8F7F4",
};

const hero: React.CSSProperties = {
  background: "#0F172A",
  color: "#F8F7F4",
  padding: "56px clamp(20px, 5vw, 72px)",
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.18em",
  color: "#F4B942",
  marginBottom: 14,
};

const eyebrowDark: React.CSSProperties = {
  ...eyebrow,
  color: "#64748B",
};

const title: React.CSSProperties = {
  fontSize: "clamp(38px, 6vw, 68px)",
  lineHeight: 1.02,
  letterSpacing: "-0.045em",
  margin: 0,
  maxWidth: 820,
};

const subtitle: React.CSSProperties = {
  maxWidth: 720,
  color: "rgba(248,247,244,.72)",
  lineHeight: 1.7,
  fontSize: 17,
  marginTop: 20,
};

const progressCard: React.CSSProperties = {
  marginTop: 32,
  maxWidth: 760,
  padding: 20,
  borderRadius: 18,
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.1)",
};

const progressLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".12em",
  color: "rgba(248,247,244,.6)",
};

const progressValue: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 900,
  marginTop: 4,
};

const progressTrack: React.CSSProperties = {
  height: 8,
  background: "rgba(255,255,255,.12)",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 14,
};

const progressFill: React.CSSProperties = {
  height: "100%",
  background: "#F4B942",
  borderRadius: 999,
};

const progressMeta: React.CSSProperties = {
  marginTop: 10,
  fontSize: 12,
  color: "rgba(248,247,244,.6)",
};

const content: React.CSSProperties = {
  padding: "40px clamp(20px, 5vw, 72px) 72px",
};

const sectionHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 24,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
  color: "#0F172A",
  letterSpacing: "-0.03em",
};

const primaryButton: React.CSSProperties = {
  border: 0,
  borderRadius: 12,
  background: "#0F172A",
  color: "#F8F7F4",
  padding: "13px 18px",
  fontWeight: 800,
  cursor: "pointer",
};

const journeyGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const journeyCard: React.CSSProperties = {
  textAlign: "left",
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 20,
  padding: 20,
  cursor: "pointer",
  minHeight: 280,
  display: "flex",
  flexDirection: "column",
};

const cardTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const number: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "#F1F5F9",
  color: "#0F172A",
  fontWeight: 900,
  fontSize: 12,
};

const statusPill: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  color: "#64748B",
};

const stepIcon: React.CSSProperties = {
  fontSize: 26,
  marginTop: 24,
};

const cardTitle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 20,
  letterSpacing: "-0.02em",
  margin: "12px 0 8px",
};

const cardBody: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
  fontSize: 14,
  flex: 1,
};

const openText: React.CSSProperties = {
  color: "#0F172A",
  fontWeight: 900,
  fontSize: 13,
  marginTop: 16,
};

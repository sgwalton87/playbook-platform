"use client";

import {
  buildAthleteNextActions,
  getNILPortfolioSummary,
  getRecruitingPipelineSummary,
} from "@/lib/scholar-athlete";

export default function ScholarAthleteDashboard() {
  const recruiting = getRecruitingPipelineSummary([
    {
      id: "1",
      schoolName: "Target University",
      stage: "conversation",
    },
    {
      id: "2",
      schoolName: "Dream College",
      stage: "visit",
    },
  ]);

  const nil = getNILPortfolioSummary([]);

  const actions = buildAthleteNextActions({
    eligibilityStatus: "action_needed",
    recruitingTargets: recruiting.total,
    activeDeals: nil.activeDeals,
    financialPlanComplete: false,
  });

  return (
    <main style={page}>
      <section style={hero}>
        <div>
          <p style={eyebrow}>Scholar-Athlete OS</p>
          <h1 style={title}>
            Academics. Athletics. Recruiting. NIL. Future.
          </h1>
          <p style={sub}>
            One command center for the complete scholar-athlete journey.
          </p>
        </div>

        <div style={identity}>
          <strong>Scholar-Athlete Profile</strong>
          <span>Eligibility intelligence active</span>
        </div>
      </section>

      <section style={metrics}>
        <Metric label="Eligibility" value="Action Needed" />
        <Metric label="Recruiting Pipeline" value={`${recruiting.total} programs`} />
        <Metric label="Visits" value={`${recruiting.visits}`} />
        <Metric label="NIL Deals" value={`${nil.activeDeals} active`} />
      </section>

      <section style={grid}>
        <Panel
          eyebrow="Eligibility Intelligence"
          title="Protect your eligibility"
          body="Track academic evidence, requirements, verification, and governing-body readiness."
        />

        <Panel
          eyebrow="Recruiting Command Center"
          title="Own your recruiting pipeline"
          body="Track programs, coaches, conversations, visits, offers, deadlines, and next actions."
        />

        <Panel
          eyebrow="NIL Deal Room"
          title="Manage opportunities professionally"
          body="Track brands, compensation, contracts, disclosures, deliverables, and payments."
        />

        <Panel
          eyebrow="Financial Intelligence"
          title="Turn opportunity into a foundation"
          body="Connect income tracking to budgeting, saving, tax education, and long-term investing lessons."
        />
      </section>

      <section style={actionsSection}>
        <p style={eyebrow}>Athlete Compass</p>
        <h2 style={sectionTitle}>Your next best actions</h2>

        <div style={actionGrid}>
          {actions.map((action) => (
            <article key={action.title} style={actionCard}>
              <span style={severity}>{action.severity}</span>
              <h3>{action.title}</h3>
              <p style={body}>{action.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric(props: { label: string; value: string }) {
  return (
    <article style={metric}>
      <span style={metricLabel}>{props.label}</span>
      <strong style={metricValue}>{props.value}</strong>
    </article>
  );
}

function Panel(props: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <article style={panel}>
      <p style={eyebrow}>{props.eyebrow}</p>
      <h2 style={panelTitle}>{props.title}</h2>
      <p style={body}>{props.body}</p>
    </article>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  padding: 32,
  background: "#F8F7F4",
  fontFamily: "system-ui, sans-serif",
};

const hero: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 18px",
  padding: 36,
  borderRadius: 30,
  background: "#0F172A",
  color: "#FFFFFF",
  display: "flex",
  justifyContent: "space-between",
  gap: 24,
  flexWrap: "wrap",
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  color: "#F97316",
  fontWeight: 950,
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

const title: React.CSSProperties = {
  maxWidth: 760,
  margin: "12px 0",
  fontSize: 54,
  lineHeight: 1,
};

const sub: React.CSSProperties = {
  maxWidth: 700,
  color: "#CBD5E1",
  fontSize: 17,
  lineHeight: 1.6,
};

const identity: React.CSSProperties = {
  alignSelf: "flex-end",
  display: "grid",
  gap: 4,
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,.08)",
};

const metrics: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 16px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
};

const metric: React.CSSProperties = {
  padding: 18,
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 18,
};

const metricLabel: React.CSSProperties = {
  display: "block",
  color: "#64748B",
  fontSize: 12,
  fontWeight: 800,
};

const metricValue: React.CSSProperties = {
  display: "block",
  marginTop: 8,
  color: "#0F172A",
  fontSize: 22,
};

const grid: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
};

const panel: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 22,
  padding: 22,
};

const panelTitle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 25,
  margin: "10px 0",
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

const actionsSection: React.CSSProperties = {
  maxWidth: 1180,
  margin: "18px auto 0",
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 24,
  padding: 24,
};

const sectionTitle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 32,
};

const actionGrid: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const actionCard: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: 16,
};

const severity: React.CSSProperties = {
  color: "#9A3412",
  background: "#FFF7ED",
  borderRadius: 999,
  padding: "5px 8px",
  fontSize: 10,
  fontWeight: 950,
  textTransform: "uppercase",
};

"use client";

import { getRoleDashboard } from "@/lib/role-os/roleDashboards";
import type { PlaybookRoleOS } from "@/lib/role-os";

export default function RoleDashboardExperience({ role }: { role: PlaybookRoleOS }) {
  const dashboard = getRoleDashboard(role);

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>{dashboard.title}</p>
        <h1 style={title}>{dashboard.greeting}</h1>
        <p style={question}>{dashboard.question}</p>
      </section>

      <section style={metricsGrid}>
        {dashboard.metrics.map(([label, value]) => (
          <article key={label} style={metricCard}>
            <p style={eyebrow}>{label}</p>
            <strong style={metricValue}>{value}</strong>
          </article>
        ))}
      </section>

      <section style={grid2}>
        <article style={card}>
          <p style={eyebrow}>Recommended Actions</p>
          <h2 style={cardTitle}>What matters next</h2>
          <div style={actionList}>
            {dashboard.actions.map((action) => (
              <div key={action} style={actionItem}>
                <span style={check}>✓</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </article>

        <article style={card}>
          <p style={eyebrow}>Compass Insight</p>
          <h2 style={cardTitle}>Role-specific intelligence</h2>
          <p style={body}>{dashboard.insight}</p>

          <div style={sharedBox}>
            <strong>Shared Source of Truth</strong>
            <span>Scholar Record + Trust Layer + Compass + Oracle + Opportunity Graph</span>
          </div>
        </article>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F8F7F4",
  padding: 32,
  fontFamily: "system-ui, sans-serif",
};

const hero: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 18px",
  background: "linear-gradient(135deg,#0F172A,#1E293B)",
  color: "#fff",
  borderRadius: 30,
  padding: 34,
  boxShadow: "0 24px 70px rgba(15,23,42,.22)",
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  fontWeight: 950,
  color: "#F97316",
  margin: 0,
};

const title: React.CSSProperties = {
  fontSize: 52,
  lineHeight: 1,
  margin: "12px 0",
};

const question: React.CSSProperties = {
  fontSize: 18,
  color: "#CBD5E1",
  lineHeight: 1.6,
};

const metricsGrid: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 18px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
};

const metricCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 22,
  padding: 20,
  boxShadow: "0 16px 40px rgba(15,23,42,.06)",
};

const metricValue: React.CSSProperties = {
  display: "block",
  color: "#0F172A",
  fontSize: 34,
  marginTop: 8,
};

const grid2: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
  gap: 16,
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 16px 40px rgba(15,23,42,.06)",
};

const cardTitle: React.CSSProperties = {
  fontSize: 25,
  color: "#0F172A",
  margin: "8px 0 14px",
};

const actionList: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const actionItem: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  color: "#0F172A",
  fontSize: 14,
  fontWeight: 800,
};

const check: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  background: "#10B981",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 900,
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
  fontSize: 15,
};

const sharedBox: React.CSSProperties = {
  display: "grid",
  gap: 6,
  background: "#FFF7ED",
  border: "1px solid #FED7AA",
  borderRadius: 16,
  padding: 16,
  marginTop: 18,
  color: "#9A3412",
};

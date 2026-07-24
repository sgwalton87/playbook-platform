"use client";

import { useState } from "react";
import type { PlaybookRoleOS } from "@/lib/role-os";
import {
  buildRoleRecommendations,
  buildRoleScenarios,
  explainRoleIntelligence,
} from "@/lib/role-intelligence";

const roles: PlaybookRoleOS[] = [
  "learner",
  "family",
  "educator",
  "mentor",
  "district",
  "university",
  "employer",
];

export default function RoleIntelligenceCenter() {
  const [role, setRole] = useState<PlaybookRoleOS>("learner");

  const rec = buildRoleRecommendations(role);
  const scenario = buildRoleScenarios(role);
  const explanation = explainRoleIntelligence(role);

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Role-Aware Intelligence Platform</p>
        <h1 style={title}>One scholar signal. Seven intelligent experiences.</h1>
        <p style={sub}>
          Recommendations and scenarios now change based on the user&apos;s relationship to the scholar.
        </p>
      </section>

      <section style={roleBar}>
        {roles.map((item) => (
          <button
            key={item}
            onClick={() => setRole(item)}
            style={{
              ...roleButton,
              background: role === item ? "#0F172A" : "#fff",
              color: role === item ? "#fff" : "#0F172A",
            }}
          >
            {item}
          </button>
        ))}
      </section>

      <section style={grid}>
        <article style={card}>
          <p style={eyebrow}>Recommendations</p>
          <h2 style={cardTitle}>{rec.signal}</h2>
          <div style={list}>
            {rec.recommendations.map((item) => (
              <div key={item} style={action}>
                <span style={check}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </article>

        <article style={card}>
          <p style={eyebrow}>Scenario</p>
          <h2 style={cardTitle}>{scenario.scenario}</h2>

          <div style={metrics}>
            <Metric label="Trust" value={`+${scenario.impact.trust}`} />
            <Metric label="Opportunity" value={`+${scenario.impact.opportunity}`} />
            <Metric label="Scholarship" value={`+$${scenario.impact.scholarship.toLocaleString()}`} />
          </div>
        </article>
      </section>

      <section style={explain}>
        <p style={eyebrow}>Explanation</p>
        <h2 style={cardTitle}>Why this matters</h2>
        <p style={body}>{explanation}</p>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
  fontSize: 54,
  lineHeight: 1,
  margin: "12px 0",
};

const sub: React.CSSProperties = {
  color: "#CBD5E1",
  fontSize: 17,
  lineHeight: 1.6,
  maxWidth: 820,
};

const roleBar: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 18px",
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const roleButton: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: 999,
  padding: "9px 12px",
  fontWeight: 900,
  cursor: "pointer",
  textTransform: "capitalize",
};

const grid: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 18px",
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
  color: "#0F172A",
  fontSize: 26,
  lineHeight: 1.15,
  margin: "8px 0 14px",
};

const list: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const action: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  color: "#0F172A",
  fontWeight: 800,
  fontSize: 14,
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

const metrics: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: 10,
};

const metric: React.CSSProperties = {
  background: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: 14,
  display: "grid",
  gap: 6,
  color: "#0F172A",
};

const explain: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 24,
  padding: 24,
};

const body: React.CSSProperties = {
  color: "#64748B",
  fontSize: 15,
  lineHeight: 1.65,
};

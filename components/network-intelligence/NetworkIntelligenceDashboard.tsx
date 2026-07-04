"use client";

import {
  buildCompassNetworkRecommendations,
  getDemoNetworkIntelligence,
} from "@/lib/network-intelligence";

export default function NetworkIntelligenceDashboard() {
  const intelligence = getDemoNetworkIntelligence();

  const recommendations = buildCompassNetworkRecommendations({
    role: "scholar",
    intelligence,
  });

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Compass Network Intelligence</p>
        <h1 style={title}>Playbook can now reason across the support network.</h1>
        <p style={sub}>
          Relationships, invitations, messages, and shared actions now produce network health, blockers, and role-aware recommendations.
        </p>
      </section>

      <section style={metrics}>
        <Metric label="Network Health" value={`${intelligence.healthScore}%`} />
        <Metric label="Relationships" value={String(intelligence.relationshipsCount)} />
        <Metric label="Messages" value={String(intelligence.messagesCount)} />
        <Metric label="Actions" value={String(intelligence.actionsCount)} />
      </section>

      <section style={grid}>
        <article style={card}>
          <p style={eyebrow}>Blockers</p>
          <h2 style={cardTitle}>What is slowing momentum?</h2>

          {intelligence.blockers.map((blocker, index) => (
            <div key={`${blocker.title}-${index}`} style={item}>
              <strong>{blocker.title}</strong>
              <p>{blocker.reason}</p>
              <span style={pill}>{blocker.role}</span>
            </div>
          ))}
        </article>

        <article style={card}>
          <p style={eyebrow}>Compass Recommendations</p>
          <h2 style={cardTitle}>Next best network actions</h2>

          {recommendations.map((rec) => (
            <div key={rec.title} style={item}>
              <strong>{rec.title}</strong>
              <p>{rec.action}</p>
              <span style={pill}>{rec.priority}</span>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article style={metric}>
      <p style={eyebrow}>{label}</p>
      <strong>{value}</strong>
    </article>
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
  background: "#0F172A",
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
  fontSize: 50,
  lineHeight: 1,
  margin: "12px 0",
};

const sub: React.CSSProperties = {
  color: "#CBD5E1",
  fontSize: 17,
  lineHeight: 1.6,
};

const metrics: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 18px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: 16,
};

const metric: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 22,
  padding: 20,
  boxShadow: "0 16px 40px rgba(15,23,42,.06)",
  color: "#0F172A",
};

const grid: React.CSSProperties = {
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
  color: "#0F172A",
  fontSize: 25,
  margin: "8px 0 16px",
};

const item: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: 14,
  marginBottom: 10,
  color: "#0F172A",
};

const pill: React.CSSProperties = {
  display: "inline-flex",
  background: "#FFF7ED",
  border: "1px solid #FED7AA",
  color: "#9A3412",
  borderRadius: 999,
  padding: "6px 9px",
  fontSize: 11,
  fontWeight: 900,
};

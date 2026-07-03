"use client";

import { getSharedOpportunityPlan } from "@/lib/collaboration";

export default function CollaborationLayer() {
  const plan = getSharedOpportunityPlan();

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Role OS Collaboration Layer</p>
        <h1 style={title}>One opportunity. Seven support experiences.</h1>
        <p style={sub}>
          {plan.scholar} matched with {plan.opportunity} at {plan.matchScore}%.
          Every role sees a different action while supporting the same goal.
        </p>
        <div style={pill}>Deadline: {plan.deadline}</div>
      </section>

      <section style={goal}>
        <p style={eyebrow}>Shared Goal</p>
        <h2 style={goalTitle}>{plan.sharedGoal}</h2>
      </section>

      <section style={grid}>
        {plan.roleActions.map(item => (
          <article key={item.role} style={card}>
            <p style={eyebrow}>{item.role}</p>
            <h2 style={cardTitle}>{item.title}</h2>
            <p style={body}>{item.action}</p>
          </article>
        ))}
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
  fontSize: 54,
  lineHeight: 1,
  margin: "12px 0",
};

const sub: React.CSSProperties = {
  fontSize: 17,
  color: "#CBD5E1",
  lineHeight: 1.6,
  maxWidth: 820,
};

const pill: React.CSSProperties = {
  display: "inline-flex",
  marginTop: 12,
  background: "#F97316",
  color: "#fff",
  borderRadius: 999,
  padding: "9px 12px",
  fontWeight: 900,
};

const goal: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 18px",
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 24,
  padding: 24,
};

const goalTitle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 30,
  margin: "8px 0 0",
};

const grid: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 16,
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 16px 40px rgba(15,23,42,.06)",
};

const cardTitle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 24,
  margin: "8px 0",
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
  fontSize: 14,
};

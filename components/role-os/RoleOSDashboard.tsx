"use client";

import Link from "next/link";
import { getRoleOS, type PlaybookRoleOS } from "@/lib/role-os";

export default function RoleOSDashboard({ role }: { role: PlaybookRoleOS }) {
  const os = getRoleOS(role);

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>{os.audience}</p>
        <h1 style={title}>{os.title}</h1>
        <p style={headline}>{os.headline}</p>
        <Link href={os.href} style={primary}>{os.primaryAction} →</Link>
      </section>

      <section style={grid}>
        {os.focus.map((item) => (
          <article key={item} style={card}>
            <p style={eyebrow}>Focus Area</p>
            <h2 style={cardTitle}>{item}</h2>
            <p style={body}>
              This role experience uses the Playbook Record, Trust Layer, Compass, Oracle, and Opportunity Graph through a role-specific lens.
            </p>
          </article>
        ))}
      </section>

      <section style={insight}>
        <p style={eyebrow}>Shared Intelligence</p>
        <h2 style={cardTitle}>One scholar. Many support roles. One trusted record.</h2>
        <p style={body}>
          Every OS experience connects back to the same learner-owned intelligence layer, so families, educators, districts, universities, and employers can support the scholar without fragmenting their story.
        </p>
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
  fontSize: 56,
  lineHeight: 1,
  margin: "12px 0",
};

const headline: React.CSSProperties = {
  fontSize: 18,
  color: "#CBD5E1",
  lineHeight: 1.6,
  maxWidth: 760,
};

const primary: React.CSSProperties = {
  display: "inline-flex",
  marginTop: 18,
  background: "#F97316",
  color: "#fff",
  borderRadius: 999,
  padding: "12px 16px",
  textDecoration: "none",
  fontWeight: 950,
};

const grid: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto 18px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
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
  fontSize: 24,
  color: "#0F172A",
  margin: "8px 0",
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
  fontSize: 14,
};

const insight: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 24,
  padding: 26,
};

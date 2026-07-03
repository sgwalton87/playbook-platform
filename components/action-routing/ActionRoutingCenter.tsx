"use client";

import Link from "next/link";
import { getRoleNotifications } from "@/lib/action-routing";

export default function ActionRoutingCenter() {
  const notifications = getRoleNotifications();

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Role OS Action Routing</p>
        <h1 style={title}>One signal. Seven role-specific actions.</h1>
        <p style={sub}>
          Playbook routes the right action to every person around the scholar so support becomes coordinated, not fragmented.
        </p>
      </section>

      <section style={grid}>
        {notifications.map(item => (
          <article key={item.role} style={card}>
            <div style={top}>
              <p style={eyebrow}>{item.role}</p>
              <span style={priority(item.priority)}>{item.priority}</span>
            </div>
            <h2 style={cardTitle}>{item.message}</h2>
            <Link href={item.route} style={button}>{item.actionLabel} →</Link>
          </article>
        ))}
      </section>
    </main>
  );
}

function priority(level: string): React.CSSProperties {
  const colors: Record<string, string> = {
    high: "#DC2626",
    medium: "#F97316",
    low: "#2563EB",
  };

  return {
    background: colors[level] || "#64748B",
    color: "#fff",
    borderRadius: 999,
    padding: "6px 9px",
    fontSize: 11,
    fontWeight: 950,
    textTransform: "uppercase",
  };
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
  color: "#CBD5E1",
  fontSize: 17,
  lineHeight: 1.6,
  maxWidth: 800,
};

const grid: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: 16,
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 16px 40px rgba(15,23,42,.06)",
};

const top: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const cardTitle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 22,
  lineHeight: 1.2,
  margin: "16px 0",
};

const button: React.CSSProperties = {
  display: "inline-flex",
  background: "#F97316",
  color: "#fff",
  borderRadius: 999,
  padding: "10px 13px",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 13,
};

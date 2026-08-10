"use client";

import { getDemoInvitations } from "@/lib/invitations";
import {
  getDemoSharedActions,
  getDemoSupportThread,
} from "@/lib/support-network-live";
import { getRelationshipGraph } from "@/lib/permissions";
import { getDemoNetworkIntelligence } from "@/lib/network-intelligence";

export default function ScholarNetworkDashboard() {
  const relationships = getRelationshipGraph();
  const invitations = getDemoInvitations();
  const messages = getDemoSupportThread();
  const actions = getDemoSharedActions();
  const intelligence = getDemoNetworkIntelligence();

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Scholar Network Dashboard</p>
        <h1 style={title}>Scholar&apos;s connected support ecosystem</h1>
        <p style={sub}>
          Supporters, invitations, messages, shared actions, and blockers now live in one scholar-centered view.
        </p>
      </section>

      <section style={metrics}>
        <Metric label="Network Health" value={`${intelligence.healthScore}%`} />
        <Metric label="Supporters" value={String(relationships.length)} />
        <Metric label="Invites" value={String(invitations.length)} />
        <Metric label="Actions" value={String(actions.length)} />
      </section>

      <section style={grid}>
        <Panel title="Supporters" items={relationships.map((r: LegacyValue) => `${r.name} — ${r.relationship}`)} />
        <Panel title="Invitations" items={invitations.map((i: LegacyValue) => `${i.inviteeName || i.invitee_name} — ${i.status}`)} />
        <Panel title="Messages" items={messages.map((m: LegacyValue) => `${m.sender_role}: ${m.body}`)} />
        <Panel title="Shared Actions" items={actions.map((a: LegacyValue) => `${a.assigned_role}: ${a.title}`)} />
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

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <article style={card}>
      <p style={eyebrow}>{title}</p>
      <h2 style={cardTitle}>{title}</h2>
      {items.map((item) => (
        <div key={item} style={itemStyle}>{item}</div>
      ))}
    </article>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", padding: 32, fontFamily: "system-ui, sans-serif" };
const hero: React.CSSProperties = { maxWidth: 1120, margin: "0 auto 18px", background: "#0F172A", color: "#fff", borderRadius: 30, padding: 34 };
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 950, color: "#F97316", margin: 0 };
const title: React.CSSProperties = { fontSize: 50, lineHeight: 1, margin: "12px 0" };
const sub: React.CSSProperties = { color: "#CBD5E1", fontSize: 17, lineHeight: 1.6 };
const metrics: React.CSSProperties = { maxWidth: 1120, margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 };
const metric: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 22, padding: 20, color: "#0F172A" };
const grid: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 };
const card: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 24, boxShadow: "0 16px 40px rgba(15,23,42,.06)" };
const cardTitle: React.CSSProperties = { color: "#0F172A", fontSize: 25, margin: "8px 0 16px" };
const itemStyle: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 14, padding: 12, marginBottom: 8, color: "#0F172A", fontSize: 13 };

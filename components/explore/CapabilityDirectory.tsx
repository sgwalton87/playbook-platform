"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CapabilityGroup, CapabilityStatus } from "@/lib/platform/capabilityMap";
import { CAPABILITY_STATUS_LABELS } from "@/lib/platform/capabilityMap";

const filters: Array<"all" | CapabilityStatus> = ["all", "available", "built-in", "in-audit", "planned"];

export default function CapabilityDirectory({ groups, currentRole }: { groups: CapabilityGroup[]; currentRole?: string | null }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CapabilityStatus>("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const haystack = `${group.label} ${group.description} ${item.label} ${item.description}`.toLowerCase();
        return (status === "all" || item.status === status) && (!needle || haystack.includes(needle));
      }),
    })).filter((group) => group.items.length);
  }, [groups, query, status]);

  const counts = useMemo(() => {
    const items = groups.flatMap((group) => group.items);
    return {
      available: items.filter((item) => item.status === "available").length,
      builtIn: items.filter((item) => item.status === "built-in").length,
      audit: items.filter((item) => item.status === "in-audit").length,
      planned: items.filter((item) => item.status === "planned").length,
      total: items.length,
    };
  }, [groups]);

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Explore Playbook</p>
        <h1 style={title}>Every capability has a home.</h1>
        <p style={subtitle}>See what has a real destination today, what is built into the platform, what is still being audited, and what is planned next. Available means a real route exists for authorized users; it does not replace end-to-end functionality certification.</p>
        <div style={metrics} aria-label="Capability status summary">
          <Metric label="Available" value={counts.available} />
          <Metric label="Built in" value={counts.builtIn} />
          <Metric label="In audit" value={counts.audit} />
          <Metric label="Planned" value={counts.planned} />
        </div>
      </section>

      <section style={controls} aria-label="Explore controls">
        <label style={label}>Search Playbook
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search FAFSA, recruiting, events, messaging…" style={input} />
        </label>
        <div style={filterRow} role="group" aria-label="Filter by status">
          {filters.map((filter) => <button key={filter} type="button" aria-pressed={status === filter} onClick={() => setStatus(filter)} style={{ ...filterButton, ...(status === filter ? selected : {}) }}>{filter === "all" ? "All" : CAPABILITY_STATUS_LABELS[filter]}</button>)}
        </div>
      </section>

      <section style={legend}>
        <Legend status="available">Real destination exists for authorized users.</Legend>
        <Legend status="built-in">Shared platform behavior, not a separate page.</Legend>
        <Legend status="in-audit">Implementation exists; functionality audit is still open.</Legend>
        <Legend status="planned">Intentional product home; not presented as functional.</Legend>
      </section>

      {visible.length ? <div style={stack}>{visible.map((group) => (
        <section key={group.id} style={section} aria-labelledby={`group-${group.id}`}>
          <header style={header}><span style={icon} aria-hidden="true">{group.icon}</span><div><h2 id={`group-${group.id}`} style={groupTitle}>{group.label}</h2><p style={description}>{group.description}</p></div></header>
          <div style={grid}>{group.items.map((item) => {
            const canOpen = item.status === "available" && Boolean(item.href);
            const relevant = Boolean(currentRole && item.roles?.includes(currentRole));
            const inner = <><div style={topline}><Badge status={item.status} />{relevant ? <span style={roleBadge}>Your OS</span> : null}</div><h3 style={cardTitle}>{item.label}</h3><p style={body}>{item.description}</p><span style={{ ...action, color: canOpen ? "#C2410C" : "#64748B" }}>{canOpen ? "Open capability →" : CAPABILITY_STATUS_LABELS[item.status]}</span></>;
            return canOpen && item.href ? <Link key={item.label} href={item.href} style={cardLink}>{inner}</Link> : <article key={item.label} style={card}>{inner}</article>;
          })}</div>
        </section>
      ))}</div> : <section style={empty} role="status"><strong>No capabilities match.</strong><span> Try another search or status.</span></section>}

      <p style={note}><strong>{counts.total} mapped capabilities.</strong> Explore is a discoverability layer only. Every destination still enforces its own role, relationship, privacy, and database authority.</p>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div style={metric}><strong style={{ fontSize: 27 }}>{value}</strong><span>{label}</span></div>; }
function Badge({ status }: { status: CapabilityStatus }) { return <span style={{ ...badge, ...badgeStyles[status] }}>{CAPABILITY_STATUS_LABELS[status]}</span>; }
function Legend({ status, children }: { status: CapabilityStatus; children: React.ReactNode }) { return <div style={legendItem}><Badge status={status} /><span>{children}</span></div>; }

const page: React.CSSProperties = { maxWidth: 1240, margin: "0 auto", padding: "clamp(18px,4vw,48px)", color: "#0F172A" };
const hero: React.CSSProperties = { padding: "clamp(28px,5vw,58px)", borderRadius: "34px 8px 34px 8px", background: "linear-gradient(135deg,#071A33,#0B2C50 64%,#3A1D45)", color: "#F8FAFC" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#FDBA74", fontSize: 11, fontWeight: 950, letterSpacing: ".16em", textTransform: "uppercase" };
const title: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(38px,7vw,76px)", lineHeight: .98, letterSpacing: "-.045em" };
const subtitle: React.CSSProperties = { maxWidth: 820, margin: 0, color: "#D8E4F0", fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.65 };
const metrics: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginTop: 28 };
const metric: React.CSSProperties = { display: "grid", gap: 4, padding: 14, borderRadius: 15, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "#D8E4F0" };
const controls: React.CSSProperties = { display: "grid", gap: 14, margin: "22px 0 12px", padding: 17, border: "1px solid #E2E8F0", borderRadius: 18, background: "white" };
const label: React.CSSProperties = { display: "grid", gap: 7, fontSize: 12, fontWeight: 900 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 13px", border: "1px solid #CBD5E1", borderRadius: 11, font: "inherit", background: "#F8FAFC" };
const filterRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 7 };
const filterButton: React.CSSProperties = { padding: "8px 11px", border: "1px solid #CBD5E1", borderRadius: 999, background: "white", color: "#334155", fontWeight: 850, cursor: "pointer" };
const selected: React.CSSProperties = { background: "#0F2744", borderColor: "#0F2744", color: "white" };
const legend: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 8, marginBottom: 24 };
const legendItem: React.CSSProperties = { display: "flex", gap: 8, alignItems: "flex-start", padding: 10, borderRadius: 12, background: "#F8FAFC", color: "#64748B", fontSize: 12 };
const stack: React.CSSProperties = { display: "grid", gap: 22 };
const section: React.CSSProperties = { padding: "clamp(18px,3vw,27px)", borderRadius: 24, background: "#F8FAFC", border: "1px solid #E2E8F0" };
const header: React.CSSProperties = { display: "grid", gridTemplateColumns: "46px minmax(0,1fr)", gap: 13, marginBottom: 16 };
const icon: React.CSSProperties = { width: 46, height: 46, display: "grid", placeItems: "center", borderRadius: 14, background: "#0F2744", color: "white", fontSize: 21 };
const groupTitle: React.CSSProperties = { margin: 0, fontSize: "clamp(24px,3vw,34px)" };
const description: React.CSSProperties = { margin: "5px 0 0", color: "#64748B", lineHeight: 1.55 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 11 };
const cardBase: React.CSSProperties = { minHeight: 184, boxSizing: "border-box", display: "flex", flexDirection: "column", padding: 17, borderRadius: "19px 6px 19px 6px", background: "white", border: "1px solid #E2E8F0" };
const card: React.CSSProperties = { ...cardBase, background: "#FCFCFD" };
const cardLink: React.CSSProperties = { ...cardBase, color: "inherit", textDecoration: "none", boxShadow: "0 7px 20px rgba(15,23,42,.045)" };
const topline: React.CSSProperties = { display: "flex", gap: 6, flexWrap: "wrap", minHeight: 23 };
const cardTitle: React.CSSProperties = { margin: "12px 0 6px", fontSize: 18 };
const body: React.CSSProperties = { margin: 0, color: "#64748B", lineHeight: 1.5, fontSize: 13 };
const action: React.CSSProperties = { marginTop: "auto", paddingTop: 15, fontSize: 12, fontWeight: 900 };
const badge: React.CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: 22, padding: "0 8px", borderRadius: 999, fontSize: 10, fontWeight: 950 };
const badgeStyles: Record<CapabilityStatus, React.CSSProperties> = { available: { background: "#DCFCE7", color: "#166534" }, "built-in": { background: "#DBEAFE", color: "#1E40AF" }, "in-audit": { background: "#FEF3C7", color: "#92400E" }, planned: { background: "#E2E8F0", color: "#475569" } };
const roleBadge: React.CSSProperties = { ...badge, background: "#FFF7ED", color: "#9A3412" };
const empty: React.CSSProperties = { padding: 26, borderRadius: 18, border: "1px dashed #CBD5E1", background: "#F8FAFC" };
const note: React.CSSProperties = { marginTop: 24, padding: 16, borderRadius: 14, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#7C2D12", lineHeight: 1.6, fontSize: 13 };

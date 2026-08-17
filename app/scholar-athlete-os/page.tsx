"use client";

import Link from "next/link";
import ScholarAthleteDashboard from "@/components/scholar-athlete/ScholarAthleteDashboard";

export default function ScholarAthleteOSPage() {
  return (
    <>
      <ScholarAthleteDashboard />
      <section aria-label="Recruiting command center" style={recruitingLaunch}>
        <div>
          <p style={eyebrow}>Recruiting is now actionable</p>
          <h2 style={title}>Build the athlete record, preserve the evidence, then move real opportunities forward.</h2>
          <p style={copy}>Keep sport, position, graduation year, highlight film, measurements, statistics, targets, recruiting history, and NIL opportunity status connected to one private Scholar-Athlete journey without manufacturing performance, coach interest, or deal approval.</p>
        </div>
        <div style={actions}>
          <Link href="/recruiting/profile" style={cta}>Build Athlete Profile & Film</Link>
          <Link href="/recruiting/evidence" style={secondaryCta}>Open Athletic Evidence Ledger</Link>
          <Link href="/recruiting" style={secondaryCta}>Open Recruiting Command Center</Link>
          <Link href="/recruiting/timeline" style={secondaryCta}>View Recruiting Timeline</Link>
          <Link href="/recruiting/nil" style={secondaryCta}>Track NIL Deal Readiness</Link>
        </div>
      </section>
    </>
  );
}

const recruitingLaunch: React.CSSProperties = {
  maxWidth: 1180,
  margin: "18px auto 28px",
  padding: "clamp(22px,4vw,36px)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 22,
  alignItems: "center",
  color: "#F8FAFC",
  background: "linear-gradient(145deg,#06172D,#0B2648)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "8px 30px 8px 30px",
};
const eyebrow: React.CSSProperties = { margin: 0, color: "#FF9D5C", fontWeight: 950, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" };
const title: React.CSSProperties = { margin: "9px 0 8px", fontSize: "clamp(25px,4vw,38px)", lineHeight: 1.05 };
const copy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.65 };
const actions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "start" };
const cta: React.CSSProperties = { justifySelf: "start", display: "inline-flex", minHeight: 46, alignItems: "center", borderRadius: 999, padding: "0 18px", background: "#FFFFFF", color: "#102238", fontWeight: 900, textDecoration: "none" };
const secondaryCta: React.CSSProperties = { ...cta, background: "transparent", color: "#FFFFFF", border: "1px solid rgba(255,255,255,.45)" };

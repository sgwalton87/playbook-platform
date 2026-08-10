"use client";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";

const readinessAreas = [
  { label: "Transcript intelligence", title: "Start with the evidence", body: "Upload or review the academic record that powers A–G calculations and readiness decisions.", href: "/transcript", action: "Open transcript" },
  { label: "A–G readiness", title: "See what is complete and what is missing", body: "Review all seven UC/CSU subject areas without presenting unverified coursework as complete.", href: "/transcript", action: "View A–G tracker" },
  { label: "Scholar Record", title: "Connect academics to the whole story", body: "Bring academic progress together with achievements, experiences, goals, and verified evidence.", href: "/record", action: "Open Scholar Record" },
  { label: "Compass", title: "Turn a gap into the next action", body: "Use readiness evidence to prioritize courses, deadlines, support, and opportunity preparation.", href: "/compass", action: "Open Compass" },
  { label: "Support", title: "Bring the right people into the plan", body: "Coordinate counselors, educators, family, mentors, and coaches through authorized relationships.", href: "/support-network", action: "Open support network" },
  { label: "Opportunity", title: "See what your progress makes reachable", body: "Explore programs and opportunities while keeping match claims grounded in verified evidence.", href: "/opportunities", action: "Explore opportunities" },
] as const;

export default function AcademicReadinessPage() {
  return (
    <PlaybookPage>
      <div data-testid="academic-readiness" data-visual-canon="PGAR-001">
        <PlaybookHero
          eyebrow="Academic Readiness"
          title="Your transcript should tell you what to do next."
          subtitle="Turn academic evidence into understandable progress, identified gaps, coordinated support, and a clear next play."
        >
          <div style={actions}>
            <PlaybookButton href="/transcript">Upload or review transcript</PlaybookButton>
            <PlaybookButton href="/record" variant="secondary">View Scholar Record</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={loop} aria-label="Academic readiness loop">
          {[
            ["01", "Evidence", "Verified courses and records"],
            ["02", "Intelligence", "Readable progress and gaps"],
            ["03", "Action", "A specific next play"],
            ["04", "Support", "The right people and authority"],
          ].map(([number, label, detail]) => (
            <article key={number} style={loopStep}>
              <span style={numberStyle}>{number}</span>
              <div><strong style={loopLabel}>{label}</strong><p style={loopDetail}>{detail}</p></div>
            </article>
          ))}
        </section>

        <PlaybookMetrics>
          <PlaybookMetric label="A–G subject areas" value="7 governed" />
          <PlaybookMetric label="Transcript status" value="Record required" />
          <PlaybookMetric label="Readiness claims" value="Evidence-bound" />
          <PlaybookMetric label="Support access" value="Consent-based" />
        </PlaybookMetrics>

        <PlaybookGrid min={300}>
          {readinessAreas.map((area) => (
            <PlaybookCard key={`${area.href}-${area.label}`} eyebrow={area.label} title={area.title}>
              <p style={body}>{area.body}</p>
              <PlaybookButton href={area.href}>{area.action}</PlaybookButton>
            </PlaybookCard>
          ))}
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}

const actions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 };
const loop: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", overflow: "hidden", color: "#F8FAFC", background: "linear-gradient(115deg,#102A4A,#102238 60%,#2B1838)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "8px 30px 8px 30px" };
const loopStep: React.CSSProperties = { display: "grid", gridTemplateColumns: "42px 1fr", gap: 12, padding: 22, borderRight: "1px solid rgba(255,255,255,.1)" };
const numberStyle: React.CSSProperties = { color: "#FF9D5C", fontWeight: 950, fontSize: 17 };
const loopLabel: React.CSSProperties = { fontSize: 18 };
const loopDetail: React.CSSProperties = { margin: "5px 0 0", color: "#C9D8E8", fontSize: 13, lineHeight: 1.45 };
const body: React.CSSProperties = { color: "#52657B", lineHeight: 1.65, margin: "0 0 20px" };

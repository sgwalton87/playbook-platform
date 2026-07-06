"use client";

import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F8F7F4", color: "#0F172A" }}>
      <section style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
        alignItems: "stretch",
      }}>
        <div style={{ padding: "clamp(28px,6vw,76px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <PlaybookLogo size={78} priority />

          <p style={eyebrow}>The Playbook Series Inc.</p>

          <h1 style={title}>
            A connected playbook for scholars, scholar-athletes, and the future they are building.
          </h1>

          <p style={body}>
            The Playbook helps traditionally underserved scholars organize transcripts,
            A-G readiness, mentors, opportunities, achievements, courses, rewards,
            community, and the next move after graduation.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
            <a href="/login" style={primary}>Log In</a>
            <a href="/login?mode=signup" style={secondary}>Create Account</a>
            <a href="/demo/founder-case-study" style={demo}>Founder Demo</a>
          </div>

          <div style={proofGrid}>
            {[
              ["Transcript", "A-G readiness starts with the record."],
              ["Compass", "Turn gaps into next actions."],
              ["Community", "Scholars do not build alone."],
              ["Rewards", "Progress becomes visible and motivating."],
            ].map(([h, p]) => (
              <div key={h} style={proofCard}>
                <strong>{h}</strong>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={visualWrap}>
          <img
            src={PLAYBOOK_HERO_VISUALS.start.image}
            alt={PLAYBOOK_HERO_VISUALS.start.alt}
            style={visual}
          />
          <div style={caption}>
            Built for Black, Latino, Indigenous, AAPI, multiracial, LGBTQIA+,
            first-generation, transition-age, and scholar-athlete communities.
          </div>
        </div>
      </section>
    </main>
  );
}

const eyebrow: React.CSSProperties = {
  marginTop: 26,
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "#F97316",
};

const title: React.CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  fontSize: "clamp(46px,7vw,86px)",
  lineHeight: .92,
  textTransform: "uppercase",
  margin: "12px 0 18px",
};

const body: React.CSSProperties = {
  fontSize: "clamp(18px,2vw,24px)",
  lineHeight: 1.55,
  color: "#475569",
  maxWidth: 760,
};

const primary: React.CSSProperties = {
  background: "#F97316",
  color: "#fff",
  padding: "18px 28px",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 950,
  fontSize: 18,
};

const secondary: React.CSSProperties = {
  background: "#0F172A",
  color: "#fff",
  padding: "18px 28px",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 950,
  fontSize: 18,
};

const demo: React.CSSProperties = {
  background: "#fff",
  color: "#0F172A",
  border: "1px solid #CBD5E1",
  padding: "18px 28px",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 950,
  fontSize: 18,
};

const proofGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
  marginTop: 36,
  maxWidth: 820,
};

const proofCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 18,
  padding: 18,
  display: "grid",
  gap: 8,
  color: "#475569",
};

const visualWrap: React.CSSProperties = {
  position: "relative",
  minHeight: 520,
  background: "#0F172A",
};

const visual: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  opacity: .86,
};

const caption: React.CSSProperties = {
  position: "absolute",
  left: 24,
  right: 24,
  bottom: 24,
  background: "rgba(15,23,42,.84)",
  color: "#F8F7F4",
  padding: 22,
  borderRadius: 22,
  fontSize: 18,
  lineHeight: 1.45,
  fontWeight: 800,
};

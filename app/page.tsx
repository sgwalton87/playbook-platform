"use client";

import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F8F7F4", color: "#0F172A" }}>
      <section style={hero}>
        <div style={copy}>
          <PlaybookLogo size={130} priority />

          <p style={eyebrow}>The Playbook</p>

          <h1 style={title}>
            Your next move starts here.
          </h1>

          <p style={subtitle}>
            Upload your transcript, track A-G progress, find opportunities,
            connect with mentors, earn rewards, and build your future story.
          </p>

          <div style={buttons}>
            <a href="/login" style={primary}>Log In</a>
            <a href="/login?mode=signup" style={secondary}>Sign Up</a>
          </div>

          <div style={quickCards}>
            {[
              ["📚", "Transcript", "Know where you stand."],
              ["🧭", "Compass", "See your next play."],
              ["🏆", "Rewards", "Earn as you grow."],
            ].map(([icon, title, text]) => (
              <div key={title} style={card}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={imageWrap}>
          <img
            src={PLAYBOOK_HERO_VISUALS.start.image}
            alt={PLAYBOOK_HERO_VISUALS.start.alt}
            style={image}
          />
        </div>
      </section>
    </main>
  );
}

const hero: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
};

const copy: React.CSSProperties = {
  padding: "clamp(28px,5vw,70px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const eyebrow: React.CSSProperties = {
  marginTop: 18,
  fontFamily: "'Space Mono', monospace",
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "#F97316",
};

const title: React.CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  fontSize: "clamp(54px,8vw,96px)",
  lineHeight: .9,
  textTransform: "uppercase",
  margin: "10px 0 18px",
  maxWidth: 760,
};

const subtitle: React.CSSProperties = {
  fontSize: "clamp(21px,2.2vw,30px)",
  lineHeight: 1.35,
  color: "#334155",
  maxWidth: 720,
  fontWeight: 750,
};

const buttons: React.CSSProperties = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
  marginTop: 26,
};

const primary: React.CSSProperties = {
  background: "#F97316",
  color: "#fff",
  padding: "18px 34px",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 950,
  fontSize: 22,
};

const secondary: React.CSSProperties = {
  background: "#0F172A",
  color: "#fff",
  padding: "18px 34px",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 950,
  fontSize: 22,
};

const quickCards: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: 12,
  marginTop: 32,
  maxWidth: 680,
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 22,
  padding: 18,
  display: "grid",
  gap: 6,
  fontSize: 15,
  color: "#64748B",
};

const imageWrap: React.CSSProperties = {
  minHeight: 420,
  background: "#0F172A",
};

const image: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

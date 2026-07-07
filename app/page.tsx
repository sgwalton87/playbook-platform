"use client";

import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";

export default function HomePage() {
  return (
    <main style={page}>
      <section style={hero}>
        <div style={copy}>
          <PlaybookLogo size={160} priority />
          <p style={eyebrow}>The Playbook</p>
          <h1 style={title}>Build your next play.</h1>
          <p style={subtitle}>
            Track school, sports, goals, mentors, money, rewards, and your future story — all in one place.
          </p>

          <div style={buttons}>
            <a href="/login" style={primary}>Log In</a>
            <a href="/login?mode=signup" style={secondary}>Sign Up</a>
          </div>
        </div>

        <div style={imageWrap}>
          <img src={PLAYBOOK_HERO_VISUALS.signup.image} alt={PLAYBOOK_HERO_VISUALS.signup.alt} style={image} />
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", color: "#0F172A" };
const hero: React.CSSProperties = { minHeight: "100vh", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))" };
const copy: React.CSSProperties = { padding: "clamp(28px,5vw,72px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 };
const eyebrow: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase", color: "#F97316", margin: 0 };
const title: React.CSSProperties = { fontFamily: "'Anton', sans-serif", fontSize: "clamp(62px,8vw,112px)", lineHeight: .88, textTransform: "uppercase", margin: 0 };
const subtitle: React.CSSProperties = { fontSize: "clamp(22px,2.4vw,32px)", lineHeight: 1.28, color: "#334155", maxWidth: 760, fontWeight: 850, margin: 0 };
const buttons: React.CSSProperties = { display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 };
const primary: React.CSSProperties = { background: "#F97316", color: "#fff", padding: "18px 40px", borderRadius: 999, textDecoration: "none", fontWeight: 950, fontSize: 24 };
const secondary: React.CSSProperties = { background: "#0F172A", color: "#fff", padding: "18px 40px", borderRadius: 999, textDecoration: "none", fontWeight: 950, fontSize: 24 };
const imageWrap: React.CSSProperties = { minHeight: 520, background: "#0F172A" };
const image: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

"use client";

import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import { ROLE_SELECTION_ROUTE } from "@/lib/roles/registry";
import Image from "next/image";

export default function HomePage() {
  return (
    <main style={page}>
      <section style={hero}>
        <div style={copy}>
          <PlaybookLogo size={122} priority />
          <p style={eyebrow}>The Playbook</p>
          <h1 style={title}>Build your next play.</h1>
          <p style={subtitle}>
            Track school, sports, goals, mentors, money, rewards, and your future story — all in one place.
          </p>

          <div style={buttons}>
            <a href="/login" style={primary}>Log In</a>
            <a href={ROLE_SELECTION_ROUTE} style={secondary}>Sign Up</a>
          </div>
        </div>

        <div style={imageWrap}>
          <Image
            src={PLAYBOOK_HERO_VISUALS.home.image}
            alt={PLAYBOOK_HERO_VISUALS.home.alt}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 48vw"
            style={image}
          />
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", color: "#0F172A", padding: "clamp(12px,2vw,24px)" };
const hero: React.CSSProperties = { width: "min(1320px,100%)", minHeight: "calc(100vh - 48px)", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", overflow: "hidden", borderRadius: 30, background: "#FFFFFF", boxShadow: "0 24px 70px rgba(15,23,42,.12)" };
const copy: React.CSSProperties = { padding: "clamp(26px,4.2vw,58px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 };
const eyebrow: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase", color: "#F97316", margin: 0 };
const title: React.CSSProperties = { fontFamily: "'Anton', sans-serif", fontSize: "clamp(48px,6vw,82px)", lineHeight: .9, textTransform: "uppercase", margin: 0 };
const subtitle: React.CSSProperties = { fontSize: "clamp(18px,1.8vw,24px)", lineHeight: 1.3, color: "#334155", maxWidth: 650, fontWeight: 800, margin: 0 };
const buttons: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 };
const primary: React.CSSProperties = { background: "#F97316", color: "#fff", padding: "14px 28px", borderRadius: 999, textDecoration: "none", fontWeight: 950, fontSize: 18, boxShadow: "0 12px 26px rgba(249,115,22,.22)" };
const secondary: React.CSSProperties = { background: "#0F172A", color: "#fff", padding: "14px 28px", borderRadius: 999, textDecoration: "none", fontWeight: 950, fontSize: 18 };
const imageWrap: React.CSSProperties = { minHeight: "clamp(340px,52vh,640px)", position: "relative", background: "#0F172A" };
const image: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: "38% center", display: "block" };

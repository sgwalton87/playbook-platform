"use client";

import Link from "next/link";
import { useState } from "react";

const modules = [
  { title: "Claim your starting line", tagline: "Make your Scholar Record yours.", href: "/profile", action: "Review my profile", help: "Your Playbook starts with you. Confirm the answers you already shared—don't enter them twice." },
  { title: "Make your academic game plan", tagline: "See where you stand and what comes next.", href: "/academic-readiness", action: "See academic readiness", help: "Start with your current classes and goals. Verified information matters more than having everything filled out today." },
  { title: "Show what you bring to the game", tagline: "Bring your athletic journey together.", href: "/recruiting/profile", action: "Build my athlete story", help: "Use your real sports, highlights, and results. You can always return with more evidence." },
  { title: "Build your starting five", tagline: "Invite trusted adults to support your next play.", href: "/invitations", action: "Invite my support team", help: "Choose each person's relationship carefully. An invite is tied to their email and proposed role, and they'll need to accept." },
  { title: "Explore your next big opportunity", tagline: "Discover possibilities that fit your preparation.", href: "/opportunities", action: "Explore opportunities", help: "Look for verified opportunities and distinguish them from PBOS readiness suggestions." },
] as const;

export default function ScholarJourneyModules() {
  const [step, setStep] = useState(0);
  const [showCoach, setShowCoach] = useState(true);
  const current = modules[step];
  return <section aria-label="Your guided Playbook" style={{ margin: "20px auto", maxWidth: 1100, padding: "clamp(18px,4vw,32px)", borderRadius: 24, background: "#FFFFFF", color: "#101D36", boxSizing: "border-box" }}>
    <p style={{ fontWeight: 900, color: "#B5430B", textTransform: "uppercase", letterSpacing: ".12em" }}>Your next play</p>
    <p style={{ fontWeight: 900, fontSize: "clamp(32px,7vw,60px)", margin: "8px 0" }}>STEP {step + 1} <span style={{ fontSize: 18, color: "#64748B" }}>of {modules.length}</span></p>
    <div aria-label="Journey steps" style={{ display: "flex", gap: 6 }}>
      {modules.map((item, index) => <button key={item.href} type="button" aria-label={`View step ${index + 1}: ${item.title}`} aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)} style={{ flex: 1, minHeight: 12, background: index === step ? "#EA580C" : "#DDE5EF", border: "none", borderRadius: 99 }} />)}
    </div>
    <h2 style={{ fontSize: "clamp(27px,6vw,44px)", lineHeight: 1.12, margin: "22px 0 10px" }}>{current.title}</h2>
    <p style={{ fontSize: 18, lineHeight: 1.5 }}>{current.tagline}</p>
    {showCoach && <aside aria-label="Coach guidance" style={{ display: "flex", gap: 14, alignItems: "start", background: "#EAF1FA", padding: 16, borderRadius: 18 }}>
      <div aria-hidden="true" style={{ borderRadius: "50%", width: 52, height: 52, flexShrink: 0, background: "#1C3551", display: "grid", placeItems: "center", fontSize: 26 }}>🏀</div>
      <div style={{ flex: 1 }}><strong>Coach&apos;s tip</strong><p style={{ margin: "6px 0 0", lineHeight: 1.5 }}>{current.help}</p></div>
      <button type="button" onClick={() => setShowCoach(false)} aria-label="Hide coaching tip" style={{ border: "none", background: "transparent", fontSize: 20 }}>×</button>
    </aside>}
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22, alignItems: "center" }}>
      <Link href={current.href} style={{ padding: "15px 22px", background: "#EA580C", color: "white", borderRadius: 12, fontWeight: 900, textDecoration: "none" }}>{current.action} →</Link>
      {step > 0 && <button type="button" onClick={() => {setStep(step - 1);setShowCoach(true);}} style={{ padding: 12 }}>Previous play</button>}
      {step < modules.length - 1 && <button type="button" onClick={() => {setStep(step + 1);setShowCoach(true);}} style={{ padding: 12 }}>See next play →</button>}
    </div>
    <p style={{ color: "#64748B", fontSize: 13, marginTop: 16 }}>These are guided destinations, not verified completed milestones. Progress is not marked complete until the underlying task is saved and validated.</p>
  </section>;
}

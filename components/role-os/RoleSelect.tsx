"use client";

import { supabase } from "@/lib/supabaseClient";
import { roleOptions } from "@/lib/role-os/roleRoutes";
import { getOnboardingDestination } from "@/lib/roles/registry";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function RoleSelect() {
  const router = useRouter();
  const [saving, setSaving] = useState("");

  const [error, setError] = useState("");

  async function choose(role: string) {
    setSaving(role);
    setError("");

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      window.location.assign(getOnboardingDestination(role));
      return;
    }

    const { error: saveError } = await supabase.from("profiles").upsert({
      id: user.id,
      role,
      profile_mode: role,
      requested_role: role,
      updated_at: new Date().toISOString(),
    });

    if (saveError) {
      setError("We could not save your pathway. Please try again.");
      setSaving("");
      return;
    }

    router.push(getOnboardingDestination(role));
  }

  return (
    <main style={page}>
      <nav style={topBar} aria-label="Welcome navigation">
        <Link href="/" style={homeLink}>← Playbook home</Link>
        <div style={accountLinks}>
          <span style={memberPrompt}>Already have an account?</span>
          <Link href="/login" style={signInLink}>Sign in</Link>
          <a href="#pathways" style={navSignup}>Choose a role</a>
        </div>
      </nav>

      <section style={hero}>
        <div style={heroCopy}>
          <PlaybookLogo size={88} priority />
          <p style={eyebrow}>Choose your Playbook</p>
          <h1 style={title}>One platform. A purpose-built OS for every role.</h1>
          <p style={lead}>
            Choose the role that best describes you. We’ll build the right profile first, then open the operating system designed for your work.
          </p>
          <div style={heroActions}>
            <a href="#pathways" style={primaryAction}>Choose your onboarding role</a>
            <a href="#pathways" style={secondaryAction}>Explore the pathways ↓</a>
          </div>
          <p style={reassurance}>Select your role first. We’ll carry it into account creation and build the right onboarding pathway.</p>
        </div>
        <div style={imageWrap}>
          <Image
            src={PLAYBOOK_HERO_VISUALS.home.image}
            alt={PLAYBOOK_HERO_VISUALS.home.alt}
            fill
            quality={90}
            sizes="(max-width: 720px) 100vw, 46vw"
            style={image}
          />
        </div>
      </section>

      <section id="pathways" style={intro}>
        <div>
          <p style={eyebrow}>Start with your role</p>
          <h2 style={sectionTitle}>Your onboarding shapes what you see, what you can do, and who you can support.</h2>
        </div>
        <span style={count}>{roleOptions.length} pathways</span>
      </section>

      {error && <div role="alert" style={errorBanner}>{error}</div>}

      <section style={grid}>
        {roleOptions.map((option, index) => (
          <button
            key={option.role}
            onClick={() => choose(option.role)}
            disabled={Boolean(saving)}
            style={roleCard}
          >
            <span style={number}>{String(index + 1).padStart(2, "0")}</span>
            <p style={cardEyebrow}>{option.role}</p>
            <h3 style={cardTitle}>{option.label}</h3>
            <p style={cardBody}>{option.description}</p>
            <strong style={action}>{saving === option.role ? "Preparing your pathway…" : "Build my Playbook →"}</strong>
          </button>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", padding: "clamp(18px,4vw,44px)", fontFamily: "'Hanken Grotesk', system-ui, sans-serif", color: "#0F172A" };
const topBar: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" };
const homeLink: React.CSSProperties = { color: "#0F172A", textDecoration: "none", fontWeight: 900, fontSize: 14 };
const accountLinks: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" };
const memberPrompt: React.CSSProperties = { color: "#64748B", fontSize: 13, fontWeight: 700 };
const signInLink: React.CSSProperties = { color: "#0F172A", fontWeight: 900, textDecoration: "none" };
const navSignup: React.CSSProperties = { background: "#F97316", color: "#FFFFFF", borderRadius: 999, padding: "10px 16px", fontWeight: 950, textDecoration: "none", boxShadow: "0 8px 20px rgba(249,115,22,.22)" };
const hero: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 32px", minHeight: 440, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", overflow: "hidden", borderRadius: 32, background: "#0F172A", boxShadow: "0 30px 80px rgba(15,23,42,.18)" };
const heroCopy: React.CSSProperties = { padding: "clamp(24px,3.5vw,44px)", display: "flex", flexDirection: "column", justifyContent: "center" };
const eyebrow: React.CSSProperties = { margin: "18px 0 8px", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 800, color: "#F97316" };
const title: React.CSSProperties = { margin: 0, maxWidth: 610, color: "#F8F7F4", fontFamily: "'Anton', sans-serif", fontWeight: 400, fontSize: "clamp(36px,4.2vw,56px)", lineHeight: .94, textTransform: "uppercase" };
const lead: React.CSSProperties = { maxWidth: 610, color: "rgba(248,247,244,.72)", fontSize: 14, lineHeight: 1.55, margin: "15px 0 0" };
const heroActions: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 20 };
const primaryAction: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#F97316", color: "#FFFFFF", borderRadius: 999, padding: "12px 18px", fontSize: 14, fontWeight: 950, textDecoration: "none", boxShadow: "0 12px 28px rgba(249,115,22,.28)" };
const secondaryAction: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(248,247,244,.28)", color: "#F8F7F4", borderRadius: 999, padding: "11px 17px", fontSize: 14, fontWeight: 900, textDecoration: "none" };
const reassurance: React.CSSProperties = { color: "rgba(248,247,244,.52)", fontSize: 12, lineHeight: 1.5, margin: "14px 0 0" };
const imageWrap: React.CSSProperties = { minHeight: 440, position: "relative", background: "#1E293B" };
const image: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: "38% center", display: "block" };
const intro: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24 };
const sectionTitle: React.CSSProperties = { maxWidth: 760, margin: 0, fontSize: "clamp(24px,3vw,38px)", lineHeight: 1.08 };
const count: React.CSSProperties = { whiteSpace: "nowrap", border: "1px solid #FED7AA", background: "#FFF7ED", color: "#C2410C", borderRadius: 999, padding: "8px 12px", fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 800, textTransform: "uppercase" };
const grid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 };
const roleCard: React.CSSProperties = { minHeight: 270, position: "relative", textAlign: "left", background: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0", borderRadius: 24, padding: 24, cursor: "pointer", boxShadow: "0 14px 36px rgba(15,23,42,.06)", display: "flex", flexDirection: "column", alignItems: "stretch" };
const number: React.CSSProperties = { position: "absolute", top: 20, right: 20, fontFamily: "'Anton', sans-serif", color: "#E2E8F0", fontSize: 36 };
const cardEyebrow: React.CSSProperties = { ...eyebrow, margin: 0, paddingRight: 48 };
const cardTitle: React.CSSProperties = { margin: "18px 0 10px", fontSize: 27, lineHeight: 1.05 };
const cardBody: React.CSSProperties = { margin: 0, color: "#64748B", fontSize: 14, lineHeight: 1.6 };
const action: React.CSSProperties = { marginTop: "auto", paddingTop: 24, color: "#F97316", fontSize: 13 };
const errorBanner: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B", borderRadius: 14, padding: "12px 16px", fontWeight: 700 };

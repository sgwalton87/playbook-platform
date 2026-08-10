"use client";

import { supabase } from "@/lib/supabaseClient";
import { roleOptions } from "@/lib/role-os/roleRoutes";
import { getOnboardingDestination } from "@/lib/roles/registry";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import CanonicalPublicFooter from "@/components/public/CanonicalPublicFooter";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

    if (user) {
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
    }

    router.push(getOnboardingDestination(role));
  }

  return (
    <main style={page} data-visual-canon="PGDS-001">
      <section style={hero}>
        <div style={heroCopy}>
          <PlaybookLogo size={118} priority />
          <p style={eyebrow}>Choose your Playbook</p>
          <h1 style={title}>One platform. A purpose-built OS for every role.</h1>
          <p style={lead}>
            Choose the role that best describes you. We’ll build the right profile first, then open the operating system designed for your work.
          </p>
        </div>
        <div style={imageWrap}>
          <Image
            src={PLAYBOOK_HERO_VISUALS.signup.image}
            alt={PLAYBOOK_HERO_VISUALS.signup.alt}
            fill
            sizes="(max-width: 720px) 100vw, 46vw"
            style={image}
          />
        </div>
      </section>

      <section style={intro}>
        <div>
          <p style={eyebrow}>Start with your role</p>
          <h2 style={sectionTitle}>Your role shapes what you see, what you can do, and who you can support.</h2>
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
      <CanonicalPublicFooter />
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "radial-gradient(circle at 78% 12%,rgba(255,91,31,.2),transparent 28%),linear-gradient(135deg,#06172D,#081D38 56%,#031023)", padding: "clamp(18px,4vw,44px)", fontFamily: "'Hanken Grotesk', system-ui, sans-serif", color: "#FFFFFF" };
const hero: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 32px", minHeight: 410, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", overflow: "hidden", borderRadius: "28px 8px 28px 8px", border:"1px solid rgba(255,255,255,.16)", background: "#07182F", boxShadow: "0 36px 100px rgba(0,0,0,.38)" };
const heroCopy: React.CSSProperties = { padding: "clamp(30px,5vw,64px)", display: "flex", flexDirection: "column", justifyContent: "center" };
const eyebrow: React.CSSProperties = { margin: "18px 0 8px", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 800, color: "#F97316" };
const title: React.CSSProperties = { margin: 0, maxWidth: 680, color: "#F8F7F4", fontFamily: "'Anton', sans-serif", fontWeight: 400, fontSize: "clamp(38px,5.5vw,72px)", lineHeight: .98, textTransform: "uppercase" };
const lead: React.CSSProperties = { maxWidth: 650, color: "rgba(248,247,244,.7)", fontSize: 16, lineHeight: 1.7, margin: "20px 0 0" };
const imageWrap: React.CSSProperties = { minHeight: 360, position: "relative", background: "#1E293B" };
const image: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const intro: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24 };
const sectionTitle: React.CSSProperties = { maxWidth: 760, margin: 0, fontSize: "clamp(24px,3vw,38px)", lineHeight: 1.08 };
const count: React.CSSProperties = { whiteSpace: "nowrap", border: "1px solid rgba(255,108,49,.5)", background: "rgba(255,91,31,.14)", color: "#FF9A6C", borderRadius: 999, padding: "8px 12px", fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 800, textTransform: "uppercase" };
const grid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 };
const roleCard: React.CSSProperties = { minHeight: 270, position: "relative", textAlign: "left", background: "rgba(255,255,255,.06)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,.16)", borderRadius: "22px 6px 22px 6px", padding: 24, cursor: "pointer", boxShadow: "0 18px 48px rgba(0,0,0,.18)", display: "flex", flexDirection: "column", alignItems: "stretch" };
const number: React.CSSProperties = { position: "absolute", top: 20, right: 20, fontFamily: "'Anton', sans-serif", color: "#E2E8F0", fontSize: 36 };
const cardEyebrow: React.CSSProperties = { ...eyebrow, margin: 0, paddingRight: 48 };
const cardTitle: React.CSSProperties = { margin: "18px 0 10px", fontSize: 27, lineHeight: 1.05 };
const cardBody: React.CSSProperties = { margin: 0, color: "#B8C8DA", fontSize: 14, lineHeight: 1.6 };
const action: React.CSSProperties = { marginTop: "auto", paddingTop: 24, color: "#F97316", fontSize: 13 };
const errorBanner: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B", borderRadius: 14, padding: "12px 16px", fontWeight: 700 };

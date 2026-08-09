"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getUserPathway, USER_PATHWAYS } from "@/lib/auth";
import CanonicalAuthShell from "@/components/auth/CanonicalAuthShell";

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh",display:"grid",placeItems:"center",background:"#06172d",color:"white" }}>Preparing your Playbook…</div>}>
      <CheckEmailContent />
    </Suspense>
  );
}

function CheckEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") || "your email";
  const role = params.get("role") || "scholar";
  const pathway = getUserPathway(role);

  async function resendConfirmation() {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/pending`,
      },
    });

    alert(error ? error.message : "Confirmation email resent. Check your inbox and spam folder.");
  }

  return (
    <CanonicalAuthShell eyebrow="Confirm your account" title="Check your inbox." description="One secure step protects your identity, your record, and the people connected to your future.">
      <section>
        <p style={eyebrow}>Confirm your email</p>

        <h1 style={{...title,fontSize:"clamp(38px,5vw,58px)"}}>Confirmation sent</h1>

        <p style={lead}>
          We sent a confirmation link to <strong>{email}</strong>. Confirm your email first,
          then your selected pathway can move into profile verification.
        </p>

        <div style={selectedCard}>
          <div style={smallEyebrowDark}>Selected pathway</div>
          <h2 style={pathwayTitle}>{pathway.label}</h2>
          <p style={cardText}>{pathway.full}</p>
          <p style={nextStep}>{pathway.nextStep}</p>
        </div>

        <div style={actions}>
          <button onClick={resendConfirmation} style={primary}>Resend Confirmation Email</button>
          <a href="/login" style={secondary}>Back to Login</a>
          <Link href="/" style={secondary}>Return Home</Link>
        </div>
      </section>

      <section style={{...rolesPanel,padding:"34px 0 0"}}>
        <div style={smallEyebrowLight}>All Playbook pathways</div>
        <h2 style={panelTitle}>Every role supports the scholar journey.</h2>

        <div style={roleGrid}>
          {USER_PATHWAYS.map((item) => (
            <article
              key={item.role}
              style={{
                ...roleCard,
                borderColor: item.role === pathway.role ? "#FF6C31" : "rgba(255,255,255,.16)",
                background: item.role === pathway.role ? "rgba(255,91,31,.16)" : "rgba(255,255,255,.05)",
              }}
            >
              <strong>{item.label}</strong>
              <p>{item.short}</p>
            </article>
          ))}
        </div>
      </section>
    </CanonicalAuthShell>
  );
}

const eyebrow: React.CSSProperties = {
  marginTop: 24,
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
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
};

const lead: React.CSSProperties = {
  fontSize: 22,
  lineHeight: 1.5,
  color: "#C7D5E5",
  maxWidth: 720,
};

const selectedCard: React.CSSProperties = {
  marginTop: 26,
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 24,
  padding: 24,
  maxWidth: 720,
};

const smallEyebrowBase: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  marginBottom: 10,
};

const smallEyebrowDark: React.CSSProperties = {
  ...smallEyebrowBase,
  color: "#FB923C",
};

const smallEyebrowLight: React.CSSProperties = {
  ...smallEyebrowBase,
  color: "#FF8A50",
};

const pathwayTitle: React.CSSProperties = {
  fontSize: 30,
  margin: "0 0 10px",
};

const cardText: React.CSSProperties = {
  color: "rgba(248,247,244,.72)",
  lineHeight: 1.6,
  fontSize: 16,
};

const nextStep: React.CSSProperties = {
  color: "#F8F7F4",
  fontWeight: 900,
  lineHeight: 1.5,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 26,
};

const primary: React.CSSProperties = {
  background: "#C2410C",
  color: "#fff",
  padding: "15px 22px",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 950,
};

const secondary: React.CSSProperties = {
  background: "#FFFFFF",
  color: "#0F172A",
  padding: "15px 22px",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 950,
};

const rolesPanel: React.CSSProperties = {
  padding: "clamp(34px,6vw,76px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const panelTitle: React.CSSProperties = {
  fontSize: "clamp(34px,5vw,58px)",
  lineHeight: 1,
  margin: "0 0 24px",
};

const roleGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};

const roleCard: React.CSSProperties = {
  border: "1.5px solid rgba(255,255,255,.16)",
  borderRadius: 18,
  padding: 16,
  background: "rgba(255,255,255,.05)",
  color: "#D9E4F0",
  lineHeight: 1.45,
};

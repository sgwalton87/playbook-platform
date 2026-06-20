"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleLogin = async () => {
  setLoading(true);
  setError(null);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  setLoading(false);

  const isOnboarded =
    profile?.first_name &&
    profile?.last_name &&
    profile?.gender &&
    profile?.school &&
    profile?.sport &&
    profile?.location;

  if (!isOnboarded) {
    router.replace("/onboarding");
  } else {
    router.replace("/dashboard");
  }
};

const handleSignUp = async () => {
  setLoading(true);
  setError(null);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  const user = data.user;

  if (!user) {
    setError("No user returned from signup");
    setLoading(false);
    return;
  }

  // 🧠 CREATE PROFILE (source of truth)
  await supabase.from("profiles").insert({
    id: user.id,
    first_name: "",
    last_name: "",
    gender: "",
    school: "",
    sport: "",
    location: "",
    date_of_birth: null,
    grad_year: null,
    gpa: null,

    // 🎮 GAMIFICATION DEFAULTS
    xp: 0,
    level: 1,
    coin_balance: 0,
  });

  setLoading(false);

  router.replace("/onboarding");
};

  const bg = "#100c0a";
  const surface = "#1a1512";
  const ink = "#f6f0e7";
  const muted = "#a89a8b";
  const line = "#332a22";
  const accent = "#ff6a2c";
  const onaccent = "#170a04";
  const mono = "'Space Mono', monospace";
  const anton = "'Anton', sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }

        /* ── Fix browser autofill white background ── */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 999px #100c0a inset !important;
          -webkit-text-fill-color: #f6f0e7 !important;
          caret-color: #f6f0e7 !important;
        }

        .pb-input {
          width: 100%;
          background: #100c0a;
          border: 1.5px solid #332a22;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 15px;
          color: #f6f0e7;
          font-family: inherit;
          outline: none;
          margin-bottom: 16px;
          display: block;
          transition: border-color 0.15s;
        }
        .pb-input:focus { border-color: #ff6a2c; }
        .pb-input::placeholder { color: #6f6151; }

        @keyframes pbMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .pb-submit:hover { opacity: 0.88; }
        .pb-toggle:hover { border-color: #ff6a2c !important; color: #ff6a2c !important; }

        @media (max-width: 768px) {
          .pb-split { grid-template-columns: 1fr !important; }
          .pb-left-panel { display: none !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <header style={{ borderBottom: `1px solid ${line}`, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pb-logo-framed.png" alt="Playbook" style={{ height: 44, width: "auto", borderRadius: 9 }} />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 0.94 }}>
            <span style={{ fontFamily: anton, fontSize: 17, letterSpacing: "0.02em", color: ink }}>PLAYBOOK</span>
            <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: "0.32em", color: accent }}>SERIES INC.</span>
          </span>
        </div>
      </header>

      {/* ── SPLIT LAYOUT ── */}
      <div className="pb-split" style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr" }}>

        {/* ── LEFT PANEL — visual, like the hero ── */}
        <div className="pb-left-panel" style={{ position: "relative", borderRight: `1px solid ${line}`, overflow: "hidden", minHeight: 500 }}>
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=1200&q=80"
            alt="Scholar-athletes"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(16,12,10,0.92) 0%, rgba(16,12,10,0.6) 100%)" }} />

          {/* Content */}
          <div style={{ position: "relative", padding: "clamp(32px,5vw,56px)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
            <div>
              {/* Ticker strip */}
              <div style={{ background: accent, color: onaccent, borderRadius: 999, padding: "6px 14px", display: "inline-block", fontFamily: anton, fontSize: 11, letterSpacing: "0.16em", marginBottom: 40 }}>
                RUN IT! ★ SCHOLAR-ATHLETES
              </div>

              <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 20, height: 2, background: accent, display: "inline-block" }} />
                The ed-tech solution
              </div>
              <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(38px,4vw,64px)", lineHeight: 0.92, textTransform: "uppercase", color: ink, margin: "0 0 20px" }}>
                Thrive on <span style={{ color: accent }}>&</span> off<br />the court.
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: muted, maxWidth: "30ch", margin: 0 }}>
                The only platform combining social networking with e-learning to build the next generation of leaders.
              </p>
            </div>

            {/* Stats row at bottom */}
            <div style={{ display: "flex", gap: 28, paddingTop: 40, borderTop: `1px solid ${line}` }}>
              {[["4", "Core pillars"], ["1,200+", "Scholars"], ["92%", "More confident"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontFamily: anton, fontSize: 28, color: ink, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginTop: 4 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — form ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>

            {/* Eyebrow */}
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 20, height: 2, background: accent, display: "inline-block" }} />
              {mode === "login" ? "Welcome back" : "Join the network"}
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(40px,5vw,58px)", lineHeight: 0.95, textTransform: "uppercase", color: ink, margin: "0 0 32px" }}>
              {mode === "login"
                ? <>Log <span style={{ color: accent }}>in</span></>
                : <>Sign <span style={{ color: accent }}>up</span> free</>
              }
            </h1>

            {/* Form card */}
            <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 20, padding: "28px 24px" }}>

              {mode === "signup" && (
                <>
                  <label style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, display: "block", marginBottom: 6 }}>Username</label>
                  <input className="pb-input" placeholder="yourhandle" value={username} onChange={(e) => setUsername(e.target.value)} />

                  <label style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, display: "block", marginBottom: 6 }}>Full Name</label>
                  <input className="pb-input" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </>
              )}

              <label style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, display: "block", marginBottom: 6 }}>Email</label>
              <input className="pb-input" placeholder="you@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

              <label style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, display: "block", marginBottom: 6 }}>Password</label>
              <input className="pb-input" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: 0 }} />

              {/* Error */}
              {error && (
                <div style={{ background: "#2a0f0a", border: "1px solid #7a2a1a", borderRadius: 10, padding: "10px 14px", marginTop: 14, fontSize: 13, color: "#ff9980" }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button className="pb-submit"
                onClick={mode === "login" ? handleLogin : handleSignUp}
                disabled={loading}
                style={{ width: "100%", fontFamily: mono, fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: loading ? line : accent, color: loading ? muted : onaccent, border: "none", borderRadius: 12, padding: "16px", cursor: loading ? "not-allowed" : "pointer", marginTop: 20, transition: "opacity 0.2s" }}>
                {loading ? "Loading..." : mode === "login" ? "Log In →" : "Create Account →"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
                <div style={{ flex: 1, height: 1, background: line }} />
                <span style={{ fontFamily: mono, fontSize: 10, color: muted, letterSpacing: "0.1em" }}>OR</span>
                <div style={{ flex: 1, height: 1, background: line }} />
              </div>

              {/* Toggle */}
              <button className="pb-toggle"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
                style={{ width: "100%", fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: "transparent", color: ink, border: `1.5px solid ${line}`, borderRadius: 12, padding: "14px", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}>
                {mode === "login" ? "No account? Sign up free" : "Already have an account? Log in"}
              </button>

            </div>

            {/* Forgot password */}
            {mode === "login" && (
              <p style={{ textAlign: "center", marginTop: 16 }}>
                <span onClick={() => router.push("/reset-password")}
                  style={{ fontFamily: mono, fontSize: 11, color: muted, letterSpacing: "0.06em", cursor: "pointer", textDecoration: "underline" }}>
                  Forgot password?
                </span>
              </p>
            )}

            <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: muted }}>
              Free to join · scholar-athletes ages 11–18 · Oakland, CA
            </p>

          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: `1px solid ${line}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: muted }}>© 2025 Playbook Series, Inc.</span>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", color: accent }}>RUN IT! ★</span>
      </div>

    </div>
  );
}
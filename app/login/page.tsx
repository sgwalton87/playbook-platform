"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { supabase } from "@/lib/supabaseClient";
import { getUserPathway, USER_PATHWAYS } from "@/lib/auth";
import { normalizeRole } from "@/lib/onboarding/pathwayMap";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { ROLE_SELECTION_ROUTE } from "@/lib/roles/registry";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const params = useSearchParams();
  const router = useRouter();
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";
  const redirectLegacySignup = initialMode === "signup" && !params.get("invite");

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState(typeof window !== "undefined" ? localStorage.getItem("playbook_saved_email") || "" : "");
  const [rememberEmail, setRememberEmail] = useState(typeof window !== "undefined" ? Boolean(localStorage.getItem("playbook_saved_email")) : false);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(() => getUserPathway(params.get("role")).role);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const isSignup = mode === "signup";

  useEffect(() => {
    if (redirectLegacySignup) router.replace(ROLE_SELECTION_ROUTE);
  }, [redirectLegacySignup, router]);

  const copy = useMemo(
    () =>
      isSignup
        ? {
            title: "Choose your path.",
            body: "Create your Playbook account and enter the pathway that matches how you support the scholar journey.",
            button: "Create Account",
          }
        : {
            title: "Run your Playbook.",
            body: "Log in to continue your journey, check progress, connect with support, and make your next play.",
            button: "Log In",
          },
    [isSignup]
  );

  if (redirectLegacySignup) {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F8F7F4", fontWeight: 900 }}>Opening role selection…</main>;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/start`,
      },
    });

    if (error) {
      setStatus(error.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      if (rememberEmail) {
        localStorage.setItem("playbook_saved_email", email);
      } else {
        localStorage.removeItem("playbook_saved_email");
      }

      if (isSignup) {
        const origin = window.location.origin;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=/pending`,
            captchaToken: captchaToken || undefined,
            data: {
              role: normalizeRole(role),
              profile_mode: normalizeRole(role),
              requested_role: normalizeRole(role),
              verification_status: "email_pending",
            },
          },
        });

        if (error) {
          setStatus(error.message);
          return;
        }

        const query = new URLSearchParams({
          email,
          role,
        });

        window.location.href = `/check-email?${query.toString()}`;
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <section style={card}>
        <div style={brand}>
          <Image
            src={isSignup ? PLAYBOOK_HERO_VISUALS.signup.image : PLAYBOOK_HERO_VISUALS.login.image}
            alt={isSignup ? PLAYBOOK_HERO_VISUALS.signup.alt : PLAYBOOK_HERO_VISUALS.login.alt}
            fill
            sizes="(max-width: 840px) 100vw, 50vw"
            style={brandImage}
          />
          <div style={brandOverlay} />
          <div style={brandContent}>
            <PlaybookLogo size={106} priority />
            <p style={eyebrow}>The Playbook</p>
            <h1 style={title}>{copy.title}</h1>
            <p style={body}>{copy.body}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={form}>
          <div>
            <p style={formEyebrow}>
              {isSignup ? "Create account" : "Welcome back"}
            </p>
            <h2 style={formTitle}>{isSignup ? "Sign up" : "Log in"}</h2>
          </div>

          {isSignup && (
            <div>
              <div style={sectionLabel}>Choose your pathway</div>
              <div style={roleGrid}>
                {USER_PATHWAYS.map((option) => {
                  const active = role === option.role;

                  return (
                    <button
                      key={option.role}
                      type="button"
                      onClick={() => setRole(option.role)}
                      style={{
                        ...roleCard,
                        borderColor: active ? "#F97316" : "#E2E8F0",
                        background: active ? "#FFF7ED" : "#FFFFFF",
                      }}
                    >
                      <strong style={{ color: active ? "#F97316" : "#0F172A" }}>
                        {option.label}
                      </strong>
                      <span>{option.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label style={label}>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@example.com"
              style={input}
            />
          </label>

          <label style={rememberRow}>
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
            />
            Save my email on this personal computer
          </label>

          <label style={label}>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
              placeholder="Enter password"
              style={input}
            />
          </label>

          {isSignup && process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && (
            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          )}

          {status && <div style={statusBox}>{status}</div>}

          <button type="button" onClick={signInWithGoogle} style={googleButton}>
            Continue with Google
          </button>

          <div style={divider}>or</div>

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? "Working..." : copy.button}
          </button>

          <div style={switchRow}>
            <span>
              {isSignup ? "Already have an account?" : "New to The Playbook?"}
            </span>
            <button
              type="button"
              onClick={() => {
                if (isSignup) setMode("login");
                else window.location.href = ROLE_SELECTION_ROUTE;
              }}
              style={switchButton}
            >
              {isSignup ? "Log in" : "Create account"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 10% 10%, rgba(249,115,22,.16), transparent 28%), #F8F7F4",
  display: "grid",
  placeItems: "center",
  padding: "clamp(14px,2vw,28px)",
  color: "#0F172A",
};

const card: React.CSSProperties = {
  width: "min(1180px, 100%)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 34,
  overflow: "hidden",
  boxShadow: "0 24px 70px rgba(15,23,42,.14)",
};

const brand: React.CSSProperties = {
  position: "relative",
  minHeight: 590,
  background: "#0F172A",
  color: "#F8F7F4",
  overflow: "hidden",
};

const brandImage: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const brandOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg,rgba(15,23,42,.74),rgba(15,23,42,.94))",
};

const brandContent: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  minHeight: 590,
  padding: "clamp(30px,4vw,52px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const eyebrow: React.CSSProperties = {
  margin: "20px 0 0",
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "#F97316",
};

const title: React.CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  fontSize: "clamp(44px,5vw,66px)",
  lineHeight: .92,
  textTransform: "uppercase",
  margin: "10px 0 16px",
  maxWidth: 440,
};

const body: React.CSSProperties = {
  color: "rgba(248,247,244,.76)",
  fontSize: 17,
  lineHeight: 1.48,
  maxWidth: 440,
  margin: 0,
};

const form: React.CSSProperties = {
  width: "100%",
  maxWidth: 620,
  margin: "0 auto",
  padding: "clamp(30px,4vw,50px)",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 14,
};

const formEyebrow: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: "#F97316",
  margin: 0,
};

const formTitle: React.CSSProperties = {
  fontSize: 34,
  lineHeight: 1.05,
  margin: "5px 0 0",
};

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#64748B",
  marginBottom: 10,
};

const roleGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
  gap: 10,
  maxHeight: 260,
  overflowY: "auto",
  paddingRight: 4,
};

const roleCard: React.CSSProperties = {
  textAlign: "left",
  border: "1.5px solid #E2E8F0",
  borderRadius: 16,
  padding: 14,
  display: "grid",
  gap: 6,
  cursor: "pointer",
  color: "#64748B",
  fontSize: 12,
  lineHeight: 1.35,
};

const label: React.CSSProperties = {
  display: "grid",
  gap: 7,
  fontWeight: 900,
};

const input: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  borderRadius: 14,
  padding: "13px 16px",
  fontSize: 16,
  outline: "none",
};

const statusBox: React.CSSProperties = {
  background: "#FFF7ED",
  color: "#9A3412",
  border: "1px solid #FED7AA",
  borderRadius: 16,
  padding: 14,
  fontWeight: 800,
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  background: "#F97316",
  color: "#FFFFFF",
  padding: "14px 22px",
  fontSize: 17,
  fontWeight: 950,
  cursor: "pointer",
};

const switchRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 8,
  flexWrap: "wrap",
  color: "#64748B",
  fontWeight: 800,
};

const switchButton: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#F97316",
  fontWeight: 950,
  cursor: "pointer",
};


const rememberRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 800,
  color: "#64748B",
};


const googleButton: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  borderRadius: 999,
  background: "#FFFFFF",
  color: "#0F172A",
  padding: "13px 20px",
  fontSize: 16,
  fontWeight: 950,
  cursor: "pointer",
};

const divider: React.CSSProperties = {
  textAlign: "center",
  color: "#94A3B8",
  fontWeight: 900,
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  textTransform: "uppercase",
};

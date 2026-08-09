"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { supabase } from "@/lib/supabaseClient";
import { USER_PATHWAYS } from "@/lib/auth";
import { normalizeRole } from "@/lib/onboarding/pathwayMap";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import { getLoginDestination, getLoginErrorMessage, type LoginProfile } from "@/lib/auth/login";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import "./login.css";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState(typeof window !== "undefined" ? localStorage.getItem("playbook_saved_email") || "" : "");
  const [rememberEmail, setRememberEmail] = useState(typeof window !== "undefined" ? Boolean(localStorage.getItem("playbook_saved_email")) : false);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("scholar");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const isSignup = mode === "signup";

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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) {
        setStatus(getLoginErrorMessage());
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("onboarding_completed,profile_mode,role")
        .eq("id", data.user.id)
        .maybeSingle<LoginProfile>();

      if (profileError) {
        await supabase.auth.signOut();
        setStatus("Your account was verified, but Playbook could not load your access profile. Please try again.");
        return;
      }

      const metadataRole =
        data.user.user_metadata?.profile_mode ||
        data.user.user_metadata?.role ||
        data.user.user_metadata?.requested_role;

      router.replace(getLoginDestination(profile, metadataRole));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <section className="playbook-login-card">
        <div className="playbook-login-brand">
          <Image unoptimized width={1200} height={800}
            src={isSignup ? PLAYBOOK_HERO_VISUALS.signup.image : PLAYBOOK_HERO_VISUALS.login.image}
            alt={isSignup ? PLAYBOOK_HERO_VISUALS.signup.alt : PLAYBOOK_HERO_VISUALS.login.alt}
            style={brandImage}
          />
          <div style={brandOverlay} />
          <div className="playbook-login-brand-content">
            <PlaybookLogo size={138} priority />
            <p style={eyebrow}>The Playbook</p>
            <h1 className="playbook-login-title">{copy.title}</h1>
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
              id="login-email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
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
              id="login-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              placeholder="Enter password"
              style={input}
            />
          </label>

          {!isSignup && (
            <Link href="/reset-password" style={forgotPasswordLink}>
              Forgot your password?
            </Link>
          )}

          {isSignup && process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && (
            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          )}

          {status && <div role="alert" aria-live="polite" style={statusBox}>{status}</div>}

          <button type="button" onClick={signInWithGoogle} style={googleButton}>
            Continue with Google
          </button>

          <div style={divider}>or</div>

          <button type="submit" disabled={loading} aria-busy={loading} style={primaryButton}>
            {loading ? "Working..." : copy.button}
          </button>

          <div style={switchRow}>
            <span>
              {isSignup ? "Already have an account?" : "New to The Playbook?"}
            </span>
            <button
              type="button"
              onClick={() => setMode(isSignup ? "login" : "signup")}
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
  padding: 24,
  color: "#0F172A",
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

const eyebrow: React.CSSProperties = {
  marginTop: 24,
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "#F97316",
};

const body: React.CSSProperties = {
  color: "rgba(248,247,244,.76)",
  fontSize: 20,
  lineHeight: 1.5,
  maxWidth: 580,
};

const form: React.CSSProperties = {
  padding: "clamp(28px,4vw,52px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 18,
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
  fontSize: 38,
  margin: "6px 0 0",
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
  gap: 8,
  fontWeight: 900,
};

const input: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  borderRadius: 16,
  padding: "15px 18px",
  fontSize: 18,
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
  padding: "17px 24px",
  fontSize: 20,
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

const forgotPasswordLink: React.CSSProperties = {
  alignSelf: "flex-end",
  color: "#9A3412",
  fontWeight: 900,
  textDecoration: "underline",
  textUnderlineOffset: 3,
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
  padding: "16px 22px",
  fontSize: 18,
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

"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const params = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignup = mode === "signup";

  const copy = useMemo(
    () =>
      isSignup
        ? {
            title: "Build your next move.",
            button: "Create Account",
            switchButton: "Log in",
          }
        : {
            title: "Run your Playbook.",
            button: "Log In",
            switchButton: "Create account",
          },
    [isSignup]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return alert(error.message);
      alert("Check your email to confirm your account.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);

    window.location.href = "/dashboard";
  }

  return (
    <main style={page}>
      <section style={card}>
        <div style={brand}>
          <PlaybookLogo size={120} priority />
          <p style={eyebrow}>The Playbook</p>
          <h1 style={title}>{copy.title}</h1>
          <p style={body}>
            Track your transcript, A-G progress, opportunities, mentors,
            rewards, and your story — all in one place.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={form}>
          <h2 style={{ fontSize: 38, margin: 0 }}>
            {isSignup ? "Sign up" : "Log in"}
          </h2>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email"
            style={input}
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
            placeholder="Password"
            style={input}
          />

          <button type="submit" style={primary}>
            {copy.button}
          </button>

          <button
            type="button"
            onClick={() => setMode(isSignup ? "login" : "signup")}
            style={switchButton}
          >
            {copy.switchButton}
          </button>
        </form>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F8F7F4",
  display: "grid",
  placeItems: "center",
  padding: 24,
};

const card: React.CSSProperties = {
  width: "min(1120px,100%)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  background: "#FFFFFF",
  borderRadius: 34,
  overflow: "hidden",
  boxShadow: "0 24px 70px rgba(15,23,42,.14)",
};

const brand: React.CSSProperties = {
  background: "#0F172A",
  color: "#F8F7F4",
  padding: "clamp(36px,5vw,70px)",
};

const eyebrow: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  color: "#F97316",
  fontWeight: 900,
  letterSpacing: ".18em",
  textTransform: "uppercase",
};

const title: React.CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  fontSize: "clamp(50px,7vw,86px)",
  lineHeight: .9,
  textTransform: "uppercase",
};

const body: React.CSSProperties = {
  fontSize: 20,
  lineHeight: 1.5,
  color: "rgba(248,247,244,.74)",
};

const form: React.CSSProperties = {
  padding: "clamp(36px,5vw,70px)",
  display: "grid",
  gap: 18,
  alignContent: "center",
};

const input: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  borderRadius: 16,
  padding: "16px 18px",
  fontSize: 18,
};

const primary: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  background: "#F97316",
  color: "#FFFFFF",
  padding: "18px 24px",
  fontSize: 20,
  fontWeight: 950,
  cursor: "pointer",
};

const switchButton: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#F97316",
  fontWeight: 950,
  cursor: "pointer",
  fontSize: 16,
};

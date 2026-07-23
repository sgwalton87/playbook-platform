"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import { getRoleDefinition, type PlaybookRole } from "@/lib/roles/registry";
import { supabase } from "@/lib/supabaseClient";
import { withTimeout } from "@/lib/async/withTimeout";

export default function OnboardingAccountGate({ role }: { role: PlaybookRole }) {
  const definition = getRoleDefinition(role);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function createAccount(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const callback = `${window.location.origin}/auth/callback?role=${encodeURIComponent(role)}`;
    try {
      const { data, error } = await withTimeout(supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callback,
          captchaToken: captchaToken || undefined,
          data: { role, profile_mode: role, requested_role: role },
        },
      }), 12_000, "Account creation is taking too long. Check your connection and try again.");

      if (error) {
        setStatus(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        window.location.reload();
        return;
      }

      window.location.href = `/check-email?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "We couldn’t create your account. Please try again.");
      setLoading(false);
    }
  }

  async function continueWithGoogle() {
    setStatus("");
    setLoading(true);
    try {
      const { error } = await withTimeout(supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${encodeURIComponent(role)}`,
        },
      }), 12_000, "Google sign-in is taking too long. Check your connection and try again.");
      if (error) setStatus(error.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Google sign-in could not start. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <section style={shell}>
        <div style={story}>
          <Image src={PLAYBOOK_HERO_VISUALS.home.image} alt={PLAYBOOK_HERO_VISUALS.home.alt} fill priority sizes="(max-width: 820px) 100vw, 46vw" style={storyImage} />
          <div style={overlay} />
          <div style={storyContent}>
            <PlaybookLogo size={92} priority />
            <p style={eyebrow}>Your selected pathway</p>
            <h1 style={title}>{definition.label}</h1>
            <p style={lead}>Create the secure account that will own your canonical Playbook Record, then continue through onboarding designed for your role.</p>
            <Link href="/role-select" style={changeRole}>← Choose a different role</Link>
          </div>
        </div>

        <form onSubmit={createAccount} style={form}>
          <div>
            <p style={formEyebrow}>Onboarding · Account checkpoint</p>
            <h2 style={formTitle}>Secure your Playbook.</h2>
            <p style={formBody}>Your role is already selected. After email confirmation, you’ll return directly to your {definition.label} onboarding.</p>
          </div>

          <label style={label}>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" style={input} /></label>
          <label style={label}>Password<input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a secure password" style={input} /></label>

          {process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && <HCaptcha sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />}
          {status && <div role="alert" style={errorBox}>{status}</div>}

          <button type="submit" disabled={loading} style={primary}>{loading ? "Creating your Playbook…" : "Create account + continue"}</button>
          <div style={divider}>or</div>
          <button type="button" onClick={continueWithGoogle} disabled={loading} style={google}>Continue with Google</button>
          <p style={returning}>Already registered? <Link href="/login" style={signIn}>Sign in</Link></p>
        </form>
      </section>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", padding: "clamp(16px,3vw,34px)", background: "radial-gradient(circle at 8% 10%,rgba(249,115,22,.14),transparent 28%),#F8F7F4", color: "#0F172A" };
const shell: React.CSSProperties = { width: "min(1160px,100%)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", overflow: "hidden", borderRadius: 32, background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 28px 80px rgba(15,23,42,.15)" };
const story: React.CSSProperties = { position: "relative", minHeight: 590, overflow: "hidden", background: "#0F172A" };
const storyImage: React.CSSProperties = { objectFit: "cover", objectPosition: "38% center" };
const overlay: React.CSSProperties = { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(15,23,42,.55),rgba(15,23,42,.96))" };
const storyContent: React.CSSProperties = { position: "relative", zIndex: 1, minHeight: 590, padding: "clamp(30px,4vw,54px)", display: "flex", flexDirection: "column", justifyContent: "center", color: "#F8F7F4" };
const eyebrow: React.CSSProperties = { margin: "22px 0 8px", color: "#F97316", fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" };
const title: React.CSSProperties = { margin: 0, fontFamily: "'Anton',sans-serif", fontSize: "clamp(48px,6vw,72px)", lineHeight: .92, textTransform: "uppercase" };
const lead: React.CSSProperties = { margin: "18px 0", maxWidth: 500, color: "rgba(248,247,244,.78)", fontSize: 17, lineHeight: 1.55 };
const changeRole: React.CSSProperties = { color: "#F8F7F4", fontWeight: 900, textDecoration: "none" };
const form: React.CSSProperties = { width: "100%", maxWidth: 610, margin: "0 auto", padding: "clamp(30px,5vw,58px)", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", gap: 15 };
const formEyebrow: React.CSSProperties = { margin: 0, color: "#F97316", fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".15em", textTransform: "uppercase" };
const formTitle: React.CSSProperties = { margin: "7px 0 8px", fontSize: "clamp(34px,4vw,48px)", lineHeight: 1 };
const formBody: React.CSSProperties = { margin: 0, color: "#64748B", lineHeight: 1.55 };
const label: React.CSSProperties = { display: "grid", gap: 7, fontWeight: 900 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #CBD5E1", borderRadius: 14, padding: "14px 16px", fontSize: 16 };
const primary: React.CSSProperties = { border: 0, borderRadius: 999, padding: "15px 20px", background: "#F97316", color: "#FFFFFF", fontSize: 17, fontWeight: 950, cursor: "pointer" };
const google: React.CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 999, padding: "14px 20px", background: "#FFFFFF", color: "#0F172A", fontSize: 16, fontWeight: 950, cursor: "pointer" };
const divider: React.CSSProperties = { textAlign: "center", color: "#94A3B8", fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 900, textTransform: "uppercase" };
const errorBox: React.CSSProperties = { border: "1px solid #FCA5A5", borderRadius: 14, padding: 12, background: "#FEF2F2", color: "#991B1B", fontWeight: 800 };
const returning: React.CSSProperties = { margin: 0, textAlign: "center", color: "#64748B", fontWeight: 800 };
const signIn: React.CSSProperties = { color: "#F97316", fontWeight: 950 };

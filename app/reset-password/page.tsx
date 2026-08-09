"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import {
  buildPasswordResetRedirect,
  getPasswordResetErrorMessage,
  getPasswordResetRequestMessage,
  isValidResetPassword,
  PASSWORD_RESET_MIN_LENGTH,
} from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import "./reset-password.css";

type ResetMode = "checking" | "request" | "update" | "complete";

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<ResetMode>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const recoveryHash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const accessToken = recoveryHash.get("access_token");
    const refreshToken = recoveryHash.get("refresh_token");

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (active && event === "PASSWORD_RECOVERY") {
        setStatus("");
        setMode("update");
      }
    });

    async function resolveRecovery() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (error) {
          setStatus(getPasswordResetErrorMessage());
          setMode("request");
          return;
        }
        window.history.replaceState({}, "", "/reset-password");
        setMode("update");
        return;
      }

      if (!accessToken || !refreshToken || recoveryHash.get("type") !== "recovery") {
        setMode("request");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (!active) return;
      window.history.replaceState({}, "", "/reset-password");
      if (error) setStatus(getPasswordResetErrorMessage());
      setMode(error ? "request" : "update");
    }

    void resolveRecovery();
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: buildPasswordResetRedirect(window.location.origin),
      });
      setStatus(getPasswordResetRequestMessage());
    } catch {
      setStatus(getPasswordResetRequestMessage());
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    if (!isValidResetPassword(password, confirmation)) {
      setStatus(
        password.length < PASSWORD_RESET_MIN_LENGTH
          ? `Use at least ${PASSWORD_RESET_MIN_LENGTH} characters for your new password.`
          : "The passwords do not match."
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus(getPasswordResetErrorMessage());
        return;
      }
      await supabase.auth.signOut();
      setPassword("");
      setConfirmation("");
      setMode("complete");
    } catch {
      setStatus(getPasswordResetErrorMessage());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="password-reset-page">
      <section className="password-reset-card" aria-labelledby="password-reset-title">
        <div className="password-reset-brand">
          <PlaybookLogo size={132} priority />
          <p className="password-reset-eyebrow">Account recovery</p>
          <h1 id="password-reset-title">
            {mode === "update" ? "Choose a new password." : "Get back in the game."}
          </h1>
          <p>Secure your Playbook account and return to the work that moves your journey forward.</p>
        </div>

        <div className="password-reset-content">
          {mode === "checking" && <p role="status">Checking your secure reset link…</p>}

          {mode === "request" && (
            <form onSubmit={requestReset} className="password-reset-form">
              <div>
                <p className="password-reset-kicker">Reset password</p>
                <h2>Send a secure link</h2>
                <p>Enter the email used for your Playbook account.</p>
              </div>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              {status && <div className="password-reset-status" role="status" aria-live="polite">{status}</div>}
              <button type="submit" disabled={loading} aria-busy={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <Link href="/login">Back to log in</Link>
            </form>
          )}

          {mode === "update" && (
            <form onSubmit={updatePassword} className="password-reset-form">
              <div>
                <p className="password-reset-kicker">Secure recovery</p>
                <h2>Create your new password</h2>
                <p id="password-rules">Use at least {PASSWORD_RESET_MIN_LENGTH} characters and choose something unique.</p>
              </div>
              <label>
                New password
                <input type="password" autoComplete="new-password" required minLength={PASSWORD_RESET_MIN_LENGTH} aria-describedby="password-rules" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
              <label>
                Confirm new password
                <input type="password" autoComplete="new-password" required minLength={PASSWORD_RESET_MIN_LENGTH} aria-describedby="password-rules" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
              </label>
              {status && <div className="password-reset-status password-reset-error" role="alert" aria-live="polite">{status}</div>}
              <button type="submit" disabled={loading} aria-busy={loading}>
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}

          {mode === "complete" && (
            <div className="password-reset-form" role="status" aria-live="polite">
              <p className="password-reset-kicker">Password updated</p>
              <h2>Your account is secure.</h2>
              <p>Log in with your new password to continue your Playbook.</p>
              <Link className="password-reset-primary-link" href="/login">Continue to log in</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

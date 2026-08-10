"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import {
  buildPasswordResetRedirectUrl,
  PASSWORD_RESET_LINK_ERROR,
  PASSWORD_RESET_MIN_LENGTH,
  PASSWORD_RESET_REQUEST_ERROR,
  PASSWORD_RESET_REQUEST_MESSAGE,
  PASSWORD_RESET_UPDATE_ERROR,
  validateResetPasswords,
} from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import "./reset-password.css";

type RecoveryState = "request" | "verifying" | "update" | "complete";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="password-reset-page">Preparing secure recovery…</main>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const params = useSearchParams();
  const hasRecoveryParameters =
    params.has("code") || params.has("token_hash") || params.get("type") === "recovery";
  const [state, setState] = useState<RecoveryState>(hasRecoveryParameters ? "verifying" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (active && event === "PASSWORD_RECOVERY") {
        setStatus("");
        setState("update");
      }
    });

    async function establishRecoverySession() {
      if (!hasRecoveryParameters) return;

      const tokenHash = params.get("token_hash");
      const code = params.get("code");
      const result = tokenHash
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
        : code
          ? await supabase.auth.exchangeCodeForSession(code)
          : { error: new Error("Missing recovery credential") };

      if (!active) return;
      if (result.error) {
        setStatus(PASSWORD_RESET_LINK_ERROR);
        setState("request");
        return;
      }

      setStatus("");
      setState("update");
    }

    void establishRecoverySession();
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [hasRecoveryParameters, params]);

  async function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildPasswordResetRedirectUrl(window.location.origin),
      });
      setStatus(error ? PASSWORD_RESET_REQUEST_ERROR : PASSWORD_RESET_REQUEST_MESSAGE);
    } catch {
      setStatus(PASSWORD_RESET_REQUEST_ERROR);
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    const validationError = validateResetPasswords(password, confirmation);
    if (validationError) {
      setStatus(validationError);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus(PASSWORD_RESET_UPDATE_ERROR);
        return;
      }

      await supabase.auth.signOut({ scope: "local" });
      setPassword("");
      setConfirmation("");
      setState("complete");
    } catch {
      setStatus(PASSWORD_RESET_UPDATE_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="password-reset-page" data-design-canon="PGDS-001">
      <section className="password-reset-card" aria-labelledby="password-reset-title">
        <aside className="password-reset-brand">
          <PlaybookLogo size={132} priority />
          <p className="password-reset-eyebrow">Account recovery</p>
          <h1 id="password-reset-title">
            {state === "complete" ? "Your next play is ready." : "Get back in your Playbook."}
          </h1>
          <p>
            Reset access securely without changing your role, Scholar Record, or progress.
          </p>
        </aside>

        <div className="password-reset-content">
          {state === "verifying" && (
            <div role="status" aria-live="polite" className="password-reset-state">
              <span className="password-reset-spinner" aria-hidden="true" />
              <h2>Verifying your reset link</h2>
              <p>This should only take a moment.</p>
            </div>
          )}

          {state === "request" && (
            <form onSubmit={requestReset} className="password-reset-form">
              <div>
                <p className="password-reset-label">Forgot your password?</p>
                <h2>Request a secure reset link</h2>
                <p>Enter your account email. For privacy, the response is the same whether an account exists or not.</p>
              </div>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              {status && <div className="password-reset-notice" role="status" aria-live="polite">{status}</div>}
              <button type="submit" disabled={loading} aria-busy={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <Link href="/login">Return to login</Link>
            </form>
          )}

          {state === "update" && (
            <form onSubmit={updatePassword} className="password-reset-form">
              <div>
                <p className="password-reset-label">Secure link verified</p>
                <h2>Create a new password</h2>
                <p id="password-rules">Use at least {PASSWORD_RESET_MIN_LENGTH} characters and a password you do not use elsewhere.</p>
              </div>
              <label>
                New password
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={PASSWORD_RESET_MIN_LENGTH}
                  required
                  aria-describedby="password-rules"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <label>
                Confirm new password
                <input
                  name="password-confirmation"
                  type="password"
                  autoComplete="new-password"
                  minLength={PASSWORD_RESET_MIN_LENGTH}
                  required
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              </label>
              {status && <div className="password-reset-notice password-reset-error" role="alert" aria-live="assertive">{status}</div>}
              <button type="submit" disabled={loading} aria-busy={loading}>
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}

          {state === "complete" && (
            <div className="password-reset-state" role="status" aria-live="polite">
              <p className="password-reset-label">Password updated</p>
              <h2>Your account is secure</h2>
              <p>Log in with your new password to continue to your authority-scoped Playbook experience.</p>
              <Link className="password-reset-primary-link" href="/login">Continue to login</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type InvitationDetails = {
  valid: true;
  email: string;
  supporterName: string;
  supporterRole: string;
  scholarName: string;
  scholarAvatarUrl: string | null;
  expiresAt: string;
};

export default function ClaimStartingFiveInvitationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [invitation, setInvitation] =
    useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingAccount, setExistingAccount] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    async function loadInvitation() {
      try {
        const response = await fetch(
          `/api/invitations/starting-five/claim/${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to load invitation.");
        }

        setInvitation(result);
        setFullName(result.supporterName || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load invitation.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      void loadInvitation();
    }
  }, [token]);

  async function claimAfterSignIn(email: string, chosenPassword: string) {
    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: chosenPassword,
      });

    if (signInError) {
      throw signInError;
    }

    const { error: claimError } = await supabase.rpc(
      "claim_starting_five_invitation",
      { p_token: token },
    );

    if (claimError) {
      throw claimError;
    }

    router.replace(
      `/onboarding?source=starting-five&role=${encodeURIComponent(
        invitation?.supporterRole || "supporter",
      )}`,
    );
    router.refresh();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!invitation) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!existingAccount && password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      if (!existingAccount) {
        const response = await fetch(
          `/api/invitations/starting-five/claim/${encodeURIComponent(token)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName,
              password,
            }),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          if (result.code === "ACCOUNT_EXISTS") {
            setExistingAccount(true);
            setConfirmation("");
            throw new Error(
              "You already have a Playbook account. Enter your existing password to claim this invitation.",
            );
          }

          throw new Error(
            result.error || "Unable to create your account.",
          );
        }
      }

      await claimAfterSignIn(invitation.email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to claim invitation.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <p style={styles.eyebrow}>PLAYBOOK SERIES</p>
          <h1 style={styles.title}>Loading your invitation…</h1>
        </section>
      </main>
    );
  }

  if (!invitation) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <p style={styles.eyebrow}>PLAYBOOK SERIES</p>
          <h1 style={styles.title}>Invitation unavailable</h1>
          <p style={styles.error}>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.eyebrow}>YOU HAVE BEEN DRAFTED</p>

        {invitation.scholarAvatarUrl ? (
          <img
            src={invitation.scholarAvatarUrl}
            alt=""
            style={styles.avatar}
          />
        ) : null}

        <h1 style={styles.title}>Welcome to Playbook</h1>

        <p style={styles.description}>
          <strong>{invitation.scholarName}</strong> invited you to join
          their Starting Five as their{" "}
          <strong>{invitation.supporterRole}</strong>.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!existingAccount ? (
            <label style={styles.label}>
              Your name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                style={styles.input}
              />
            </label>
          ) : null}

          <label style={styles.label}>
            Email
            <input
              value={invitation.email}
              readOnly
              aria-readonly="true"
              style={{ ...styles.input, ...styles.lockedInput }}
            />
            <span style={styles.helper}>
              This email is secured to your invitation.
            </span>
          </label>

          <label style={styles.label}>
            {existingAccount ? "Existing password" : "Create password"}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              autoComplete={
                existingAccount ? "current-password" : "new-password"
              }
              required
              style={styles.input}
            />
          </label>

          {!existingAccount ? (
            <label style={styles.label}>
              Confirm password
              <input
                type="password"
                value={confirmation}
                onChange={(event) =>
                  setConfirmation(event.target.value)
                }
                minLength={8}
                autoComplete="new-password"
                required
                style={styles.input}
              />
            </label>
          ) : null}

          {error ? <p style={styles.error}>{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.65 : 1,
            }}
          >
            {submitting
              ? "Claiming your seat…"
              : existingAccount
                ? "Sign In & Claim Invitation"
                : "Create Profile & Join Starting Five"}
          </button>
        </form>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "48px 20px",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(circle at top, #315744 0%, #18382d 42%, #10271f 100%)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    padding: "42px",
    borderRadius: 28,
    background: "#fffdf8",
    boxShadow: "0 28px 80px rgba(0,0,0,.28)",
    color: "#18251f",
  },
  eyebrow: {
    margin: "0 0 18px",
    textAlign: "center",
    color: "#a57928",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 2.2,
  },
  avatar: {
    display: "block",
    width: 76,
    height: 76,
    margin: "0 auto 18px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #d8b56b",
  },
  title: {
    margin: "0 0 14px",
    textAlign: "center",
    fontSize: 34,
    lineHeight: 1.1,
  },
  description: {
    margin: "0 auto 30px",
    maxWidth: 440,
    textAlign: "center",
    lineHeight: 1.7,
    color: "#526059",
  },
  form: {
    display: "grid",
    gap: 18,
  },
  label: {
    display: "grid",
    gap: 8,
    fontSize: 14,
    fontWeight: 800,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    border: "1px solid #cfc8ba",
    borderRadius: 14,
    background: "#ffffff",
    color: "#18251f",
    fontSize: 16,
    outline: "none",
  },
  lockedInput: {
    background: "#efebe2",
    color: "#59635e",
  },
  helper: {
    color: "#748079",
    fontSize: 12,
    fontWeight: 500,
  },
  button: {
    marginTop: 8,
    padding: "16px 20px",
    border: 0,
    borderRadius: 999,
    background: "#d8b56b",
    color: "#18251f",
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
  },
  error: {
    margin: 0,
    padding: "12px 14px",
    borderRadius: 12,
    background: "#fff0ed",
    color: "#a33125",
    fontSize: 14,
    lineHeight: 1.5,
  },
};

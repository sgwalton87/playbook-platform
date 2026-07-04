"use client";

import { supabase } from "@/lib/supabaseClient";
import {
  buildInviteLoginPath,
  buildInviteSignupPath,
  INVITE_TOKEN_STORAGE_KEY,
} from "@/lib/invite-auth";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const token = params.token;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Accept your Playbook invitation.");

  async function ensureAuth() {
    const { data } = await supabase.auth.getUser();

    if (data?.user) return true;

    window.localStorage.setItem(INVITE_TOKEN_STORAGE_KEY, token);
    return false;
  }

  async function respond(status: "accepted" | "declined") {
    setLoading(true);

    const authenticated = await ensureAuth();

    if (!authenticated) {
      setLoading(false);
      router.push(buildInviteLoginPath(token));
      return;
    }

    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          status,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || "Something went wrong.");
        return;
      }

      window.localStorage.removeItem(INVITE_TOKEN_STORAGE_KEY);

      if (status === "declined") {
        setMessage("Invitation declined.");
        return;
      }

      router.push(json.destination || "/role-select");
    } catch {
      setMessage("Unable to process the invitation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <section style={card}>
        <p style={eyebrow}>Playbook Invitation</p>

        <h1 style={title}>{message}</h1>

        <p style={body}>
          Accepting this invitation connects you to the scholar&apos;s support
          network with relationship-aware permissions and routes you into the
          correct Playbook OS.
        </p>

        <div style={actions}>
          <button disabled={loading} onClick={() => respond("accepted")} style={primary}>
            {loading ? "Working..." : "Accept invitation"}
          </button>

          <button disabled={loading} onClick={() => respond("declined")} style={secondary}>
            Decline
          </button>

          <button
            disabled={loading}
            onClick={() => {
              window.localStorage.setItem(INVITE_TOKEN_STORAGE_KEY, token);
              router.push(buildInviteSignupPath(token));
            }}
            style={secondary}
          >
            Create account first
          </button>
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F8F7F4",
  padding: 32,
  display: "grid",
  placeItems: "center",
  fontFamily: "system-ui, sans-serif",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 680,
  boxSizing: "border-box",
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 28,
  padding: 34,
  boxShadow: "0 24px 70px rgba(15,23,42,.12)",
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  fontWeight: 950,
  color: "#F97316",
  margin: 0,
};

const title: React.CSSProperties = {
  fontSize: 42,
  color: "#0F172A",
  lineHeight: 1,
  margin: "12px 0",
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
  fontSize: 16,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 20,
};

const primary: React.CSSProperties = {
  background: "#F97316",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 999,
  padding: "12px 15px",
  fontWeight: 950,
  cursor: "pointer",
};

const secondary: React.CSSProperties = {
  background: "#FFFFFF",
  color: "#0F172A",
  border: "1px solid #E2E8F0",
  borderRadius: 999,
  padding: "12px 15px",
  fontWeight: 950,
  cursor: "pointer",
};

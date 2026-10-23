"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { requirePlaybookRole } from "@/lib/roles/registry";

type InviteResult = {
  invitation?: { id: string; inviteeName: string; inviteeEmail: string };
  email?: { url?: string };
  deliveryStatus?: string;
  deliveryError?: string;
  error?: string;
};

export default function InvitationCenter() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InviteResult | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (mounted) setAuthorized(false); return; }
      const profile = await supabase.from("profiles").select("role,profile_mode").eq("id", user.id).maybeSingle();
      let authorized = false;
      if (!profile.error) {
        try {
          const role = requirePlaybookRole(profile.data?.profile_mode ?? profile.data?.role);
          authorized = ["scholar", "scholar-athlete", "transition-youth"].includes(role);
        } catch {
          authorized = false; // Unknown role must never inherit Scholar invitation authority.
        }
      }
      if (mounted) setAuthorized(authorized);
    })();
    return () => { mounted = false; };
  }, []);

  async function sendInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/invitations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeName: name.trim(), inviteeEmail: email.trim(), relationship: "parent_guardian" }),
      });
      const payload: InviteResult = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to create invitation.");
      setResult(payload);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to create invitation.");
    } finally { setBusy(false); }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "clamp(20px,4vw,52px)", background: "#07182D", color: "#fff" }}>
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(24px,4vw,42px)", background: "#102540", border: "1px solid #36506E", borderRadius: 24 }}>
        <p style={{ color: "#FF9A6C", fontWeight: 800, letterSpacing: 2, fontSize: 12 }}>SCHOLAR SUPPORT NETWORK</p>
        <h1 style={{ fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.12 }}>Invite a Parent or Guardian</h1>
        <p style={{ lineHeight: 1.6, color: "#D2DEEF" }}>You decide who can support your journey. An invitation never gives someone ownership of your record. The invited adult must sign in using the exact invited email and accept before their Family OS access is activated.</p>
        {authorized === null && <p role="status">Checking your Scholar account…</p>}
        {authorized === false && <p role="alert">Only a signed-in Scholar, Scholar-Athlete, or Transition Youth account can create a Parent/Guardian invitation. Sign into the Scholar account to continue.</p>}
        {authorized && (
          <form onSubmit={sendInvitation} style={{ display: "grid", gap: 16, marginTop: 24 }}>
            <label htmlFor="guardian-name">Parent/Guardian name</label>
            <input id="guardian-name" required value={name} onChange={event => setName(event.target.value)} autoComplete="name" style={field} />
            <label htmlFor="guardian-email">Parent/Guardian email</label>
            <input id="guardian-email" required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" style={field} />
            <button disabled={busy} type="submit" style={button}>{busy ? "Creating invitation…" : "Send Parent/Guardian invitation"}</button>
          </form>
        )}
        {error && <p role="alert" style={{ color: "#FFC1AD" }}>{error}</p>}
        {result && <div role="status" style={{ marginTop: 24, padding: 18, borderRadius: 14, background: "#1C3551" }}>
          <strong>Invitation created for {result.invitation?.inviteeName}.</strong>
          <p>{result.deliveryStatus === "sent" ? "The invitation email was sent." : "Email delivery was not confirmed. Use the secure invitation link below to share it privately with the invited person."}</p>
          {result.email?.url && <p><a style={{ color: "#FFC28C", overflowWrap: "anywhere" }} href={result.email.url}>Open invitation link</a> — share only with the intended recipient.</p>}
        </div>}
        <p style={{ marginTop: 22, fontSize: 13, color: "#ABBED2" }}>The Family relationship grants only progress, deadlines and support-task permissions. Access can be revoked.</p>
      </section>
    </main>
  );
}
const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", borderRadius: 10, background: "#fff", color: "#07182D", padding: 13, border: "1px solid #A3B3C8", fontSize: 16 };
const button: React.CSSProperties = { background: "#F97338", color: "#fff", padding: 14, borderRadius: 12, fontWeight: 800, border: "none", cursor: "pointer" };

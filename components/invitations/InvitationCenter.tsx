"use client";

import { useEffect, useState } from "react";


const INVITABLE_RELATIONSHIPS = [
  { value: "parent_guardian", label: "Parent / Guardian" },
  { value: "mentor", label: "Mentor (requires validation)" },
  { value: "educator", label: "Educator / Teacher" },
  { value: "counselor", label: "High School Counselor" },
  { value: "coach", label: "High School Coach" },
  { value: "college_recruiter", label: "College Coach / Recruiter" },
  { value: "college_admissions", label: "College Admissions" },
  { value: "district_admin", label: "District / School Administrator" },
  { value: "community_partner", label: "Community Partner" },
  { value: "brand_partner", label: "Brand Partner (verification required)" },
  { value: "employer_partner", label: "Employer / Workforce Partner" },
] as const;

type ManagedInvitation = { id: string; invitee_name: string; invitee_email: string; relationship: string; status: string };
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
  const [relationship, setRelationship] = useState<string>("parent_guardian");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InviteResult | null>(null);
  const [invitations, setInvitations] = useState<ManagedInvitation[]>([]);

  useEffect(() => {
    let mounted = true;
    void fetch("/api/invitations/manage", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!mounted) return;
        setAuthorized(response.ok && payload.authorized === true);
        if (response.ok) setInvitations(payload.invitations || []);
        else setError(payload.error || "Unable to verify invitation permissions.");
      })
      .catch(() => { if (mounted) { setAuthorized(false); setError("Unable to verify invitation permissions. Try signing in again."); } });
    return () => { mounted = false; };
  }, []);

  async function reloadInvitations() {
    try {
      const response = await fetch("/api/invitations/manage", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      setInvitations(payload.invitations || []);
    } catch { /* Form stays usable on list failures. */ }
  }

  async function withdrawInvitation(invitationId: string) {
    if (!window.confirm("Withdraw this pending invitation? To select a different role, send a new one.")) return;
    setError("");
    try {
      const response = await fetch("/api/invitations/manage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw", invitationId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to withdraw invitation.");
      await reloadInvitations();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to withdraw invitation.");
    }
  }

  async function sendInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/invitations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeName: name.trim(), inviteeEmail: email.trim(), relationship }),
      });
      const payload: InviteResult = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to create invitation.");
      setResult(payload);
      await reloadInvitations();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to create invitation.");
    } finally { setBusy(false); }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "clamp(20px,4vw,52px)  clamp(20px,4vw,52px) calc(180px + env(safe-area-inset-bottom))", background: "#07182D", color: "#fff" }}>
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(24px,4vw,42px)", background: "#102540", border: "1px solid #36506E", borderRadius: 24 }}>
        <p style={{ color: "#FF9A6C", fontWeight: 800, letterSpacing: 2, fontSize: 12 }}>SCHOLAR SUPPORT NETWORK</p>
        <h1 style={{ fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.12 }}>Invite someone to your Support Network</h1>
        <p style={{ lineHeight: 1.6, color: "#D2DEEF" }}>You decide who can support your journey. An invitation does not transfer ownership of your record. Select a role and send the invitation to the exact email the supporter will use. Each support relationship follows its own verification requirements.</p>
        {authorized === null && <p role="status">Checking your Scholar account…</p>}
        {authorized === false && <p role="alert">Your account cannot currently send invitations. Check the authorization message below or sign in with the Scholar, Scholar-Athlete, or Transition Youth account that owns this record.</p>}
        {authorized && (
          <form onSubmit={sendInvitation} style={{ display: "grid", gap: 16, marginTop: 24 }}>
            <label htmlFor="support-role">Proposed supporter account type</label>
            <select id="support-role" value={relationship} onChange={(event) => setRelationship(event.target.value)} style={field}>
              {INVITABLE_RELATIONSHIPS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <p style={{ color: "#D2DEEF", margin: 0 }}>The invited person must use exactly this email to accept. The proposed relationship type cannot be changed after sending. To choose a different type, revoke the pending invitation and send a new one. Existing account roles are not automatically changed.</p>
            <label htmlFor="guardian-name">Invitee name</label>
            <input id="guardian-name" required value={name} onChange={event => setName(event.target.value)} autoComplete="name" style={field} />
            <label htmlFor="guardian-email">Invitee email</label>
            <input id="guardian-email" required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" style={field} />
            <button disabled={busy} type="submit" style={button}>{busy ? "Creating invitation…" : "Send Support Network invitation"}</button>
          </form>
        )}
        {authorized && <section style={{ marginTop: 26 }}>
          <h2 style={{ fontSize: 23 }}>Your invitations</h2>
          <p>Pending invitations are tied to the email and relationship you selected. Withdraw a pending request and resend to change its proposed type.</p>
          {invitations.map((invitation) => (
            <div key={invitation.id} style={{ padding: 14, border: "1px solid #36506E", borderRadius: 12, marginTop: 10 }}>
              <strong>{invitation.invitee_name}</strong>
              <p style={{ overflowWrap: "anywhere" }}>{invitation.invitee_email} · {invitation.relationship.replaceAll("_", " ")} · {invitation.status}</p>
              {invitation.status === "pending" && <button type="button" style={button} onClick={() => void withdrawInvitation(invitation.id)}>Withdraw pending request</button>}
            </div>
          ))}
        </section>}
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

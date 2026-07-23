"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookHero, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

const INVITED_ROLES = [
  { role: "family", relationship: "parent_guardian", label: "Parent / Guardian" },
  { role: "mentor", relationship: "mentor", label: "Mentor / Trusted Adult" },
  { role: "educator", relationship: "educator", label: "Teacher / Educator" },
  { role: "counselor", relationship: "educator", label: "School Counselor" },
  { role: "coach", relationship: "educator", label: "High School Coach" },
] as const;

type Invitation = {
  id: string;
  invitee_name: string;
  invitee_email: string;
  invited_role: string;
  status: string;
  destination: string;
};

export default function LiveInvitationCenter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("family");
  const [scholarName, setScholarName] = useState("A Playbook learner");
  const [accessToken, setAccessToken] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [status, setStatus] = useState("Loading your invitations…");

  async function load() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token || !data.session?.user) {
      setStatus("Sign in to manage invitations.");
      return;
    }
    setAccessToken(token);

    const [{ data: profile }, response] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name,username")
        .eq("id", data.session.user.id)
        .maybeSingle(),
      fetch("/api/invitations/send", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setScholarName(profile?.full_name || profile?.username || "A Playbook learner");

    if (!response.ok) {
      setStatus("We couldn’t load your invitations.");
      return;
    }
    const result = await response.json();
    setInvitations(result.invitations || []);
    setStatus(result.invitations?.length ? "" : "No invitations sent yet.");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function sendInvitation() {
    if (!name.trim() || !email.trim() || !accessToken) return;
    const selected = INVITED_ROLES.find((option) => option.role === role) || INVITED_ROLES[0];
    setStatus("Sending secure invitation…");

    const response = await fetch("/api/invitations/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        inviteeName: name.trim(),
        inviteeEmail: email.trim(),
        relationship: selected.relationship,
        invitedRole: selected.role,
        scholarName,
      }),
    });

    if (!response.ok) {
      const result = await response.json();
      setStatus(result.error || "Invitation could not be sent.");
      return;
    }

    setName("");
    setEmail("");
    setStatus("Invitation sent.");
    await load();
  }

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Starting Five Invitations"
        title="Invite real people into the right support role."
        subtitle="Every invitation carries a precise role, secure token, matching onboarding pathway, and pending-to-active relationship lifecycle."
      />

      <section style={layout}>
        <article style={card}>
          <p style={eyebrow}>New invitation</p>
          <label style={label}>Their name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} style={input} />
          <label style={label}>Their email</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={input} />
          <label style={label}>Their role in your Playbook</label>
          <select value={role} onChange={(event) => setRole(event.target.value)} style={input}>
            {INVITED_ROLES.map((option) => (
              <option key={option.role} value={option.role}>{option.label}</option>
            ))}
          </select>
          <button onClick={sendInvitation} style={send}>Send secure invitation</button>
          {status && <p style={body}>{status}</p>}
        </article>

        <article style={card}>
          <p style={eyebrow}>Invitation lifecycle</p>
          <h2 style={title}>Pending and activated connections</h2>
          <div style={list}>
            {invitations.map((invitation) => (
              <div key={invitation.id} style={invitationCard}>
                <div style={row}>
                  <strong>{invitation.invitee_name}</strong>
                  <PlaybookPill>{invitation.status}</PlaybookPill>
                </div>
                <p style={body}>{invitation.invitee_email}</p>
                <p style={body}>{invitation.invited_role.replaceAll("-", " ")} onboarding → {invitation.destination}</p>
              </div>
            ))}
          </div>
          <PlaybookButton href="/support-network">Open live network</PlaybookButton>
        </article>
      </section>
    </PlaybookPage>
  );
}

const layout: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 };
const card: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 24, padding: 24 };
const eyebrow: React.CSSProperties = { color: "#F97316", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 950 };
const title: React.CSSProperties = { color: "#0F172A", fontSize: 28 };
const label: React.CSSProperties = { display: "block", margin: "14px 0 6px", color: "#0F172A", fontWeight: 850 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #CBD5E1", borderRadius: 14, padding: 12, background: "#FFFFFF" };
const send: React.CSSProperties = { marginTop: 16, border: 0, borderRadius: 999, padding: "12px 16px", background: "#F97316", color: "#FFFFFF", fontWeight: 950, cursor: "pointer" };
const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.5 };
const list: React.CSSProperties = { display: "grid", gap: 10, marginBottom: 18 };
const invitationCard: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 16, padding: 14 };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, color: "#0F172A" };

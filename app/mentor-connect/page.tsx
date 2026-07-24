"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

const roles = ["", "mentor", "teacher", "counselor", "coach", "administrator"];

export default function MentorConnectPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [mentors, setMentors] = useState<LegacyValue[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/mentor-directory?q=${encodeURIComponent(q)}&role=${encodeURIComponent(role)}`);
    const json = await res.json();
    setMentors(json.mentors || []);
  }, [q, role]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Mentor Connect"
        title="Find mentors, coaches, teachers, counselors, and administrators."
        subtitle="Accepted supporters can become searchable directory resources while private scholar data stays permission-protected."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/invitations">Invite Supporter</PlaybookButton>
          <PlaybookButton href="/support-network" variant="secondary">My Support Network</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookCard eyebrow="Search Directory" title="Who can help?">
        <div style={searchRow}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, organization, expertise..." style={input} />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={input}>
            {roles.map((r) => <option key={r} value={r}>{r || "all roles"}</option>)}
          </select>
          <button onClick={load} style={button}>Search</button>
        </div>
      </PlaybookCard>

      <PlaybookGrid>
        {mentors.map((person) => (
          <PlaybookCard key={person.id} eyebrow={person.role} title={person.display_name}>
            <p style={body}>{person.organization || "Independent supporter"}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(person.expertise || []).map((x: string) => <PlaybookPill key={x}>{x}</PlaybookPill>)}
            </div>
            <div style={{ marginTop: 14 }}>
              <PlaybookButton href="/invitations">Request Connection</PlaybookButton>
            </div>
          </PlaybookCard>
        ))}
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const searchRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 180px auto", gap: 10 };
const input: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 12, padding: 12 };
const button: React.CSSProperties = { border: 0, borderRadius: 12, background: "#0F172A", color: "#F8F7F4", padding: "12px 16px", fontWeight: 900 };
const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };

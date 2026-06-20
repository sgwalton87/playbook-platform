"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Mentor = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  focus: string[];
  bio: string;
  scholars: number;
  available: boolean;
};

type Circle = {
  id: string;
  name: string;
  mentor: string;
  mentorInitials: string;
  mentorColor: string;
  pillar: string;
  pillarColor: string;
  members: number;
  maxMembers: number;
  nextSession: string;
  joined: boolean;
};

const MENTORS: Mentor[] = [
  { id: "1", name: "Coach J. Reed", initials: "JR", color: "#ff6a2c", role: "Founder & ED", focus: ["Leadership", "Career"], bio: "Former division-1 athlete turned educator. 12 years building scholar-athletes into community leaders.", scholars: 48, available: true },
  { id: "2", name: "M. Alvarez", initials: "MA", color: "#1D9E75", role: "Head of Curriculum", focus: ["Finance", "NIL"], bio: "Financial educator specializing in athlete money management and building generational wealth.", scholars: 32, available: true },
  { id: "3", name: "T. Okafor", initials: "TO", color: "#378ADD", role: "Community Lead", focus: ["Civic", "Advocacy"], bio: "Youth organizer and policy advocate who has worked with 200+ young leaders across the Bay Area.", scholars: 29, available: false },
  { id: "4", name: "S. Nguyen", initials: "SN", color: "#D4537E", role: "Product & Tech", focus: ["SEL", "Wellness"], bio: "Tech professional focused on mental performance and social-emotional growth for student athletes.", scholars: 21, available: true },
];

const CIRCLES: Circle[] = [
  { id: "1", name: "Captain's Circle", mentor: "Coach J. Reed", mentorInitials: "JR", mentorColor: "#ff6a2c", pillar: "Leadership", pillarColor: "#ff6a2c", members: 8, maxMembers: 12, nextSession: "Sat, Jun 22 · 10am", joined: true },
  { id: "2", name: "Money Moves", mentor: "M. Alvarez", mentorInitials: "MA", mentorColor: "#1D9E75", pillar: "Finance", pillarColor: "#1D9E75", members: 10, maxMembers: 12, nextSession: "Wed, Jun 25 · 5pm", joined: false },
  { id: "3", name: "Civic Leaders Lab", mentor: "T. Okafor", mentorInitials: "TO", mentorColor: "#378ADD", pillar: "Civic", pillarColor: "#378ADD", members: 12, maxMembers: 12, nextSession: "Fri, Jun 27 · 4pm", joined: false },
  { id: "4", name: "Mind & Body", mentor: "S. Nguyen", mentorInitials: "SN", mentorColor: "#D4537E", pillar: "SEL", pillarColor: "#D4537E", members: 6, maxMembers: 10, nextSession: "Thu, Jun 26 · 6pm", joined: false },
];

const bg = "#100c0a";
const surface = "#1a1512";
const surface2 = "#241c16";
const ink = "#f6f0e7";
const muted = "#a89a8b";
const faint = "#6f6151";
const line = "#332a22";
const accent = "#ff6a2c";
const onaccent = "#170a04";
const mono = "'Space Mono', monospace";
const anton = "'Anton', sans-serif";

export default function MentorshipPage() {
  const router = useRouter();
  const [circles, setCircles] = useState<Circle[]>(CIRCLES);
  const [tab, setTab] = useState<"circles" | "mentors">("circles");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setAuthed(true);
    });
  }, []);

  const toggleJoin = (id: string) => {
    setCircles((c) => c.map((circle) =>
      circle.id === id
        ? { ...circle, joined: !circle.joined, members: circle.joined ? circle.members - 1 : circle.members + 1 }
        : circle
    ));
  };

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontSize: 12, letterSpacing: "0.1em", color: faint }}>
      LOADING...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pb-nav-btn:hover { color: ${ink} !important; }
        .pb-card:hover { border-color: ${accent} !important; }
      `}</style>

      <header style={{ background: surface, borderBottom: `1px solid ${line}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontFamily: anton, fontSize: 18, color: ink, letterSpacing: "0.02em" }}>PLAYBOOK</span>
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: "0.3em", color: accent }}>SERIES INC.</span>
        </div>
        <nav style={{ display: "flex", gap: 6 }}>
          {[{ label: "Home", path: "/dashboard" }, { label: "Feed", path: "/feed" }, { label: "Courses", path: "/courses" }, { label: "Mentorship", path: "/mentorship" }].map(({ label, path }) => (
            <button key={label} onClick={() => router.push(path)} className="pb-nav-btn"
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: "none", color: label === "Mentorship" ? accent : muted, cursor: "pointer", padding: "8px 12px", borderRadius: 8 }}>
              {label}
            </button>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); router.replace("/"); }}
            style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: `1px solid ${line}`, color: muted, cursor: "pointer", padding: "8px 12px", borderRadius: 999 }}>
            Log out
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>The community</p>
          <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(32px,4vw,52px)", lineHeight: 0.95, textTransform: "uppercase", color: ink, marginBottom: 16 }}>
            Mentorship <span style={{ color: accent }}>circles</span>
          </h1>
          <p style={{ fontSize: 15, color: muted, maxWidth: "52ch", lineHeight: 1.6 }}>
            Small groups led by real mentors. Join a circle, show up to sessions, and build relationships that last beyond the platform.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {(["circles", "mentors"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: tab === t ? accent : "transparent", color: tab === t ? onaccent : muted, border: `1px solid ${tab === t ? accent : line}`, borderRadius: 999, padding: "9px 18px", cursor: "pointer", transition: "all 0.15s" }}>
              {t === "circles" ? "Circles" : "Meet the mentors"}
            </button>
          ))}
        </div>

        {/* CIRCLES TAB */}
        {tab === "circles" && (
          <div>
            {/* My circles */}
            {circles.filter((c) => c.joined).length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: 14 }}>Your circles</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {circles.filter((c) => c.joined).map((c) => (
                    <div key={c.id} style={{ display: "flex", gap: 16, alignItems: "center", background: surface, border: `1px solid ${accent}55`, borderRadius: 16, padding: "16px 20px" }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: c.mentorColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: anton, fontSize: 16, color: onaccent, flexShrink: 0 }}>{c.mentorInitials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: ink }}>{c.name}</span>
                          <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.pillarColor, background: surface2, padding: "2px 7px", borderRadius: 999 }}>{c.pillar}</span>
                        </div>
                        <div style={{ fontFamily: mono, fontSize: 11, color: faint }}>Next session: {c.nextSession} · {c.members}/{c.maxMembers} members</div>
                      </div>
                      <button onClick={() => toggleJoin(c.id)}
                        style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: `1px solid ${line}`, color: muted, borderRadius: 999, padding: "9px 16px", cursor: "pointer" }}>
                        Leave
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All circles */}
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: 14 }}>All circles</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
              {circles.map((c) => {
                const full = c.members >= c.maxMembers && !c.joined;
                return (
                  <div key={c.id} className="pb-card"
                    style={{ background: surface, border: `1px solid ${c.joined ? accent + "55" : line}`, borderRadius: 18, padding: "20px 22px", transition: "border-color 0.15s", opacity: full ? 0.55 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: c.mentorColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: anton, fontSize: 16, color: onaccent, flexShrink: 0 }}>{c.mentorInitials}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: muted }}>Led by {c.mentor}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.pillarColor, background: surface2, padding: "3px 8px", borderRadius: 999 }}>{c.pillar}</span>
                      {full && <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: faint, background: surface2, padding: "3px 8px", borderRadius: 999 }}>Full</span>}
                    </div>
                    <div style={{ fontFamily: mono, fontSize: 10, color: faint, marginBottom: 6 }}>Next: {c.nextSession}</div>
                    <div style={{ background: line, borderRadius: 999, height: 4, marginBottom: 16, overflow: "hidden" }}>
                      <div style={{ background: c.pillarColor, height: "100%", width: `${Math.round((c.members / c.maxMembers) * 100)}%`, borderRadius: 999 }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: faint }}>{c.members}/{c.maxMembers} members</span>
                      <button onClick={() => !full && toggleJoin(c.id)}
                        style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: c.joined ? "transparent" : full ? surface2 : accent, color: c.joined ? muted : full ? faint : onaccent, border: `1px solid ${c.joined ? line : full ? line : accent}`, borderRadius: 999, padding: "9px 16px", cursor: full ? "default" : "pointer", transition: "all 0.15s" }}>
                        {c.joined ? "Joined ✓" : full ? "Full" : "Join circle"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MENTORS TAB */}
        {tab === "mentors" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
            {MENTORS.map((m) => (
              <div key={m.id} className="pb-card"
                style={{ background: surface, border: `1px solid ${line}`, borderRadius: 18, padding: "22px 22px", transition: "border-color 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 54, height: 54, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: anton, fontSize: 20, color: onaccent, flexShrink: 0 }}>{m.initials}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: ink, marginBottom: 3 }}>{m.name}</div>
                    <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: m.color }}>{m.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: muted, marginBottom: 14 }}>{m.bio}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {m.focus.map((f) => (
                    <span key={f} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: surface2, border: `1px solid ${line}`, color: muted }}>{f}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${line}`, paddingTop: 14 }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: faint }}>{m.scholars} scholars</span>
                  <span style={{ fontFamily: mono, fontSize: 10, color: m.available ? "#1D9E75" : faint, fontWeight: 700 }}>
                    {m.available ? "● Available" : "● Full"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Scholar = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  school: string;
  sport: string;
  level: number;
  xp: number;
  badges: string[];
  pillars: string[];
  connected: boolean;
  requested: boolean;
};

const SUGGESTED: Scholar[] = [
  { id: "1", name: "Jordan Miles", initials: "JM", color: "#1D9E75", role: "Scholar-Athlete", school: "Oakland Tech", sport: "Basketball", level: 5, xp: 890, badges: ["Leader", "Scholar"], pillars: ["Leadership", "Finance"], connected: false, requested: false },
  { id: "2", name: "Aisha Thompson", initials: "AT", color: "#378ADD", role: "Scholar-Athlete", school: "Fremont High", sport: "Track", level: 4, xp: 760, badges: ["Scholar", "Streak x14"], pillars: ["SEL", "Civic"], connected: false, requested: false },
  { id: "3", name: "Marcus Davis", initials: "MD", color: "#D4537E", role: "Scholar-Athlete", school: "McClymonds", sport: "Football", level: 4, xp: 640, badges: ["Leader"], pillars: ["Leadership", "SEL"], connected: false, requested: false },
  { id: "4", name: "Zara Osei", initials: "ZO", color: "#854F0B", role: "Scholar-Athlete", school: "Castlemont", sport: "Soccer", level: 3, xp: 510, badges: ["Civic Star"], pillars: ["Civic", "Finance"], connected: false, requested: false },
  { id: "5", name: "DeShawn King", initials: "DK", color: "#534AB7", role: "Scholar-Athlete", school: "Oakland High", sport: "Baseball", level: 3, xp: 420, badges: ["Scholar"], pillars: ["Finance", "Leadership"], connected: false, requested: false },
  { id: "6", name: "Priya Nair", initials: "PN", color: "#0F6E56", role: "Scholar-Athlete", school: "Skyline High", sport: "Swimming", level: 2, xp: 280, badges: [], pillars: ["SEL"], connected: false, requested: false },
];

const CONNECTED: Scholar[] = [
  { id: "7", name: "Coach J. Reed", initials: "JR", color: "#ff6a2c", role: "Mentor", school: "Playbook HQ", sport: "—", level: 10, xp: 9999, badges: ["Founder", "Legend"], pillars: ["Leadership", "Finance", "Civic", "SEL"], connected: true, requested: false },
  { id: "8", name: "M. Alvarez", initials: "MA", color: "#1D9E75", role: "Mentor", school: "Playbook HQ", sport: "—", level: 9, xp: 8200, badges: ["Finance Pro"], pillars: ["Finance"], connected: true, requested: false },
];

const PILLAR_COLORS: Record<string, string> = {
  Leadership: "#ff6a2c",
  Finance: "#1D9E75",
  Civic: "#378ADD",
  SEL: "#D4537E",
};

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

export default function ConnectionsPage() {
  const router = useRouter();
  const [suggested, setSuggested] = useState<Scholar[]>(SUGGESTED);
  const [connected, setConnected] = useState<Scholar[]>(CONNECTED);
  const [tab, setTab] = useState<"suggested" | "connected">("suggested");
  const [search, setSearch] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setAuthed(true);
    });
  }, []);

  const sendRequest = (id: string) => {
    setSuggested((s) => s.map((x) => x.id === id ? { ...x, requested: true } : x));
  };

  const cancelRequest = (id: string) => {
    setSuggested((s) => s.map((x) => x.id === id ? { ...x, requested: false } : x));
  };

  const disconnect = (id: string) => {
    setConnected((c) => c.filter((x) => x.id !== id));
  };

  const filtered = (tab === "suggested" ? suggested : connected).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.school.toLowerCase().includes(search.toLowerCase()) ||
    s.sport.toLowerCase().includes(search.toLowerCase())
  );

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
        input::placeholder { color: ${faint}; }
        input:focus { border-color: ${accent} !important; outline: none; }
      `}</style>

      {/* NAV */}
      <header style={{ background: surface, borderBottom: `1px solid ${line}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontFamily: anton, fontSize: 18, color: ink, letterSpacing: "0.02em" }}>PLAYBOOK</span>
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: "0.3em", color: accent }}>SERIES INC.</span>
        </div>
        <nav style={{ display: "flex", gap: 6 }}>
          {[{ label: "Home", path: "/dashboard" }, { label: "Feed", path: "/feed" }, { label: "Connections", path: "/connections" }, { label: "Mentorship", path: "/mentorship" }].map(({ label, path }) => (
            <button key={label} onClick={() => router.push(path)} className="pb-nav-btn"
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: "none", color: label === "Connections" ? accent : muted, cursor: "pointer", padding: "8px 12px", borderRadius: 8 }}>
              {label}
            </button>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); router.replace("/"); }}
            style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: `1px solid ${line}`, color: muted, cursor: "pointer", padding: "8px 12px", borderRadius: 999 }}>
            Log out
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>The network</p>
          <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(32px,4vw,52px)", lineHeight: 0.95, textTransform: "uppercase", color: ink, marginBottom: 16 }}>
            Connections
          </h1>
          <p style={{ fontSize: 15, color: muted, maxWidth: "48ch", lineHeight: 1.6 }}>
            Find scholars, athletes, and mentors across the Playbook network. Connect, collaborate, and grow together.
          </p>
        </div>

        {/* Search + tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by name, school, or sport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, background: surface, border: `1px solid ${line}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: ink, fontFamily: "inherit", transition: "border-color 0.15s" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {(["suggested", "connected"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: tab === t ? accent : "transparent", color: tab === t ? onaccent : muted, border: `1px solid ${tab === t ? accent : line}`, borderRadius: 999, padding: "9px 18px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                {t === "suggested" ? `Suggested (${suggested.length})` : `Connected (${connected.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: 40, textAlign: "center" }}>
            <p style={{ fontFamily: mono, fontSize: 12, color: faint, letterSpacing: "0.08em" }}>No results found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
            {filtered.map((s) => (
              <div key={s.id} className="pb-card"
                style={{ background: surface, border: `1px solid ${s.connected ? accent + "44" : line}`, borderRadius: 18, padding: "20px 22px", transition: "border-color 0.15s" }}>

                {/* Avatar + name */}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: anton, fontSize: 18, color: onaccent, flexShrink: 0 }}>
                    {s.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: ink, marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: s.role === "Mentor" ? accent : muted }}>{s.role}</div>
                    <div style={{ fontSize: 12, color: faint, marginTop: 2 }}>{s.school} {s.sport !== "—" && `· ${s.sport}`}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: anton, fontSize: 20, color: ink, lineHeight: 1 }}>Lv.{s.level}</div>
                    <div style={{ fontFamily: mono, fontSize: 9, color: faint }}>{s.xp} XP</div>
                  </div>
                </div>

                {/* Pillars */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {s.pillars.map((p) => (
                    <span key={p} style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: PILLAR_COLORS[p] || muted, background: surface2, padding: "3px 8px", borderRadius: 999 }}>{p}</span>
                  ))}
                </div>

                {/* Badges */}
                {s.badges.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
                    {s.badges.map((b) => (
                      <span key={b} style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: surface2, border: `1px solid ${line}`, color: muted }}>{b}</span>
                    ))}
                  </div>
                )}

                {/* Action */}
                <div style={{ borderTop: `1px solid ${line}`, paddingTop: 14 }}>
                  {s.connected ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: accent, color: onaccent, border: "none", borderRadius: 999, padding: "10px", cursor: "pointer" }}>
                        Message
                      </button>
                      <button onClick={() => disconnect(s.id)}
                        style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: "transparent", color: faint, border: `1px solid ${line}`, borderRadius: 999, padding: "10px 14px", cursor: "pointer" }}>
                        Remove
                      </button>
                    </div>
                  ) : s.requested ? (
                    <button onClick={() => cancelRequest(s.id)}
                      style={{ width: "100%", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: "transparent", color: muted, border: `1px solid ${line}`, borderRadius: 999, padding: "10px", cursor: "pointer" }}>
                      Request sent · Cancel
                    </button>
                  ) : (
                    <button onClick={() => sendRequest(s.id)}
                      style={{ width: "100%", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: accent, color: onaccent, border: "none", borderRadius: 999, padding: "10px", cursor: "pointer" }}>
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

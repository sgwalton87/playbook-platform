"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Scholar = {
  rank: number;
  name: string;
  initials: string;
  color: string;
  school: string;
  level: number;
  xp: number;
  coins: number;
  badges: number;
  streak: number;
  pillar: string;
  isYou?: boolean;
};

const ALL_SCHOLARS: Scholar[] = [
  { rank: 1,  name: "Jordan Miles",    initials: "JM", color: "#1D9E75", school: "Oakland Tech",    level: 5, xp: 890,  coins: 180, badges: 6, streak: 21, pillar: "Leadership" },
  { rank: 2,  name: "Aisha Thompson",  initials: "AT", color: "#378ADD", school: "Fremont High",    level: 4, xp: 760,  coins: 152, badges: 5, streak: 14, pillar: "SEL" },
  { rank: 3,  name: "Marcus Davis",    initials: "MD", color: "#D4537E", school: "McClymonds",      level: 4, xp: 640,  coins: 128, badges: 4, streak: 10, pillar: "Leadership" },
  { rank: 4,  name: "Stephisha W.",    initials: "SW", color: "#ff6a2c", school: "Lincoln High",    level: 3, xp: 340,  coins: 68,  badges: 3, streak: 7,  pillar: "Leadership", isYou: true },
  { rank: 5,  name: "Zara Osei",       initials: "ZO", color: "#854F0B", school: "Castlemont",      level: 3, xp: 510,  coins: 102, badges: 3, streak: 9,  pillar: "Civic" },
  { rank: 6,  name: "DeShawn King",    initials: "DK", color: "#534AB7", school: "Oakland High",    level: 3, xp: 420,  coins: 84,  badges: 2, streak: 5,  pillar: "Finance" },
  { rank: 7,  name: "Priya Nair",      initials: "PN", color: "#0F6E56", school: "Skyline High",    level: 2, xp: 280,  coins: 56,  badges: 1, streak: 3,  pillar: "SEL" },
  { rank: 8,  name: "Terrence Brown",  initials: "TB", color: "#993C1D", school: "Castlemont",      level: 2, xp: 240,  coins: 48,  badges: 1, streak: 2,  pillar: "Civic" },
  { rank: 9,  name: "Kezia Mensah",    initials: "KM", color: "#185FA5", school: "Fremont High",    level: 2, xp: 200,  coins: 40,  badges: 1, streak: 4,  pillar: "Finance" },
  { rank: 10, name: "Ray Gutierrez",   initials: "RG", color: "#3B6D11", school: "Oakland Tech",    level: 1, xp: 140,  coins: 28,  badges: 0, streak: 1,  pillar: "Leadership" },
];

type SortKey = "xp" | "coins" | "badges" | "streak";
type FilterKey = "All" | "Leadership" | "Finance" | "Civic" | "SEL";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

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

export default function LeaderboardPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortKey>("xp");
  const [pillarFilter, setPillarFilter] = useState<FilterKey>("All");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setAuthed(true);
    });
  }, []);

  const sorted = [...ALL_SCHOLARS]
    .filter((s) => pillarFilter === "All" ? true : s.pillar === pillarFilter)
    .sort((a, b) => b[sortBy] - a[sortBy])
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const you = ALL_SCHOLARS.find((s) => s.isYou);
  const yourRank = sorted.findIndex((s) => s.isYou) + 1;

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
        .pb-row:hover { border-color: ${accent} !important; }
        .pb-sort:hover { color: ${ink} !important; }
      `}</style>

      <header style={{ background: surface, borderBottom: `1px solid ${line}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontFamily: anton, fontSize: 18, color: ink, letterSpacing: "0.02em" }}>PLAYBOOK</span>
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: "0.3em", color: accent }}>SERIES INC.</span>
        </div>
        <nav style={{ display: "flex", gap: 6 }}>
          {[{ label: "Home", path: "/dashboard" }, { label: "Feed", path: "/feed" }, { label: "Courses", path: "/courses" }, { label: "Leaderboard", path: "/leaderboard" }].map(({ label, path }) => (
            <button key={label} onClick={() => router.push(path)} className="pb-nav-btn"
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: "none", color: label === "Leaderboard" ? accent : muted, cursor: "pointer", padding: "8px 12px", borderRadius: 8 }}>
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
          <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>The standings</p>
          <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(32px,4vw,52px)", lineHeight: 0.95, textTransform: "uppercase", color: ink }}>
            Leaderboard
          </h1>
        </div>

        {/* Your position card */}
        {you && (
          <div style={{ background: surface, border: `1px solid ${accent}55`, borderRadius: 16, padding: "18px 22px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: accent }}>Your rank</div>
            <div style={{ fontFamily: anton, fontSize: 42, color: accent, lineHeight: 1 }}>#{yourRank || you.rank}</div>
            <div style={{ display: "flex", gap: 24, flex: 1, flexWrap: "wrap" }}>
              {[
                { label: "XP", val: you.xp },
                { label: "Coins", val: you.coins },
                { label: "Badges", val: you.badges },
                { label: "Streak", val: `${you.streak}d` },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontFamily: anton, fontSize: 24, color: ink, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: faint, marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/dashboard")}
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: accent, color: onaccent, border: "none", borderRadius: 999, padding: "10px 18px", cursor: "pointer" }}>
              Earn more XP →
            </button>
          </div>
        )}

        {/* Top 3 podium */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          {sorted.slice(0, 3).map((s) => (
            <div key={s.name}
              style={{ background: s.rank === 1 ? surface2 : surface, border: `1px solid ${s.rank === 1 ? accent : line}`, borderRadius: 16, padding: "20px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{MEDAL[s.rank]}</div>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: anton, fontSize: 18, color: onaccent, margin: "0 auto 10px" }}>{s.initials}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: ink, marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: faint, marginBottom: 10 }}>{s.school}</div>
              <div style={{ fontFamily: anton, fontSize: 26, color: s.rank === 1 ? accent : ink }}>{s[sortBy]}{sortBy === "streak" ? "d" : ""}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: faint, letterSpacing: "0.1em", textTransform: "uppercase" }}>{sortBy}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["All", "Leadership", "Finance", "Civic", "SEL"] as FilterKey[]).map((f) => (
              <button key={f} onClick={() => setPillarFilter(f)}
                style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: pillarFilter === f ? accent : "transparent", color: pillarFilter === f ? onaccent : faint, border: `1px solid ${pillarFilter === f ? accent : line}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer", transition: "all 0.15s" }}>
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: faint, alignSelf: "center", letterSpacing: "0.08em" }}>Sort by:</span>
            {(["xp", "coins", "badges", "streak"] as SortKey[]).map((s) => (
              <button key={s} onClick={() => setSortBy(s)} className="pb-sort"
                style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: sortBy === s ? surface2 : "transparent", color: sortBy === s ? ink : faint, border: `1px solid ${sortBy === s ? line : "transparent"}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", transition: "all 0.15s" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Full table */}
        <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 18, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 80px 80px", gap: 0, padding: "12px 20px", borderBottom: `1px solid ${line}` }}>
            {["#", "Scholar", "XP", "Coins", "Badges", "Streak"].map((h) => (
              <div key={h} style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: faint }}>{h}</div>
            ))}
          </div>
          {/* Rows */}
          {sorted.map((s, i) => (
            <div key={s.name} className="pb-row"
              style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 80px 80px", gap: 0, padding: "14px 20px", borderBottom: i < sorted.length - 1 ? `1px solid ${line}` : "none", background: s.isYou ? "#1e1510" : "transparent", border: s.isYou ? `1px solid ${accent}33` : "none", transition: "border-color 0.15s", cursor: "pointer" }}>
              <div style={{ fontFamily: mono, fontSize: 12, color: s.rank <= 3 ? accent : faint, fontWeight: 700, display: "flex", alignItems: "center" }}>
                {s.rank <= 3 ? MEDAL[s.rank] : `#${s.rank}`}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: anton, fontSize: 13, color: onaccent, flexShrink: 0 }}>{s.initials}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.isYou ? accent : ink }}>{s.name} {s.isYou && "(you)"}</div>
                  <div style={{ fontSize: 11, color: faint }}>{s.school} · Lv.{s.level}</div>
                </div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 13, color: sortBy === "xp" ? accent : ink, display: "flex", alignItems: "center", fontWeight: sortBy === "xp" ? 700 : 400 }}>{s.xp}</div>
              <div style={{ fontFamily: mono, fontSize: 13, color: sortBy === "coins" ? accent : ink, display: "flex", alignItems: "center", fontWeight: sortBy === "coins" ? 700 : 400 }}>{s.coins}</div>
              <div style={{ fontFamily: mono, fontSize: 13, color: sortBy === "badges" ? accent : ink, display: "flex", alignItems: "center", fontWeight: sortBy === "badges" ? 700 : 400 }}>{s.badges}</div>
              <div style={{ fontFamily: mono, fontSize: 13, color: sortBy === "streak" ? accent : ink, display: "flex", alignItems: "center", fontWeight: sortBy === "streak" ? 700 : 400 }}>{s.streak}d</div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

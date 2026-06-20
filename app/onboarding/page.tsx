"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { addReward } from "@/lib/gamification";
import { checkBadges } from "@/lib/badges";
import { updateStreak } from "@/lib/streak";

// ─── Types ────────────────────────────────────────────────────────────────────
type Profile = {
  first_name: string;
  xp: number;
  level: number;
  coin_balance: number;
};

type ActivityItem = {
  id: string;
  text: string;
  time: string;
  initials: string;
  color: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const COURSES = [
  { id: "captains-mindset", icon: "★", name: "Captain's Mindset", pillar: "Leadership", modules: 6, done: 3 },
  { id: "money-in-the-game", icon: "$", name: "Money in the Game", pillar: "Finance", modules: 8, done: 1 },
  { id: "mind-of-an-athlete", icon: "♥", name: "Mind of an Athlete", pillar: "SEL", modules: 5, done: 0 },
];

const SAMPLE_ACTIVITY: ActivityItem[] = [
  { id: "1", text: "You earned the Scholar badge", time: "2 hours ago", initials: "YOU", color: "#ff6a2c" },
  { id: "2", text: "Coach Reed commented on your progress", time: "Yesterday", initials: "CR", color: "#1D9E75" },
  { id: "3", text: "You completed Module 3 of Captain's Mindset", time: "2 days ago", initials: "YOU", color: "#ff6a2c" },
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

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return router.replace("/login");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);

      const s = await updateStreak(user.id);
      setStreak(s);

      await addReward(user.id, { coins: 10, xp: 20 });
      setToast(`Day ${s} streak! +10 coins +20 XP`);

      const newBadges = checkBadges(data);
      setBadges(newBadges);

      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleActionReward = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;
    const updated = await addReward(user.id, { coins: 25, xp: 50 });
    const newBadges = checkBadges(updated);
    setBadges(newBadges);
    setToast("+25 coins · +50 XP earned!");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontSize: 12, letterSpacing: "0.1em", color: faint }}>
      LOADING YOUR PLAYBOOK...
    </div>
  );

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const coins = profile?.coin_balance ?? 0;
  const xpForNext = level * 500;
  const xpPct = Math.min(100, Math.round((xp / xpForNext) * 100));

  return (
    <div style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pb-nav-btn:hover { color: ${ink} !important; }
        .pb-course-row:hover { border-color: ${accent} !important; cursor: pointer; }
        .pb-action-btn:hover { opacity: 0.85; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, background: accent, color: onaccent, padding: "12px 18px", borderRadius: 12, fontWeight: 700, fontSize: 13, fontFamily: mono, letterSpacing: "0.04em" }}>
          {toast}
        </div>
      )}

      {/* NAV */}
      <header style={{ background: surface, borderBottom: `1px solid ${line}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontFamily: anton, fontSize: 18, color: ink, letterSpacing: "0.02em" }}>PLAYBOOK</span>
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: "0.3em", color: accent }}>SERIES INC.</span>
        </div>
        <nav style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Home", path: "/dashboard" },
            { label: "Profile", path: "/profile" },
            { label: "Courses", path: "/courses" },
            { label: "Notifications", path: "/notifications" },
          ].map(({ label, path }) => (
            <button key={label} onClick={() => router.push(path)}
              className="pb-nav-btn"
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: "none", color: muted, cursor: "pointer", padding: "8px 12px", borderRadius: 8 }}>
              {label}
            </button>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); router.replace("/"); }}
            style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: `1px solid ${line}`, color: muted, cursor: "pointer", padding: "8px 12px", borderRadius: 999 }}>
            Log out
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

        {/* LEFT COLUMN */}
        <div>

          {/* Welcome */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Your playbook</p>
            <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(32px,4vw,48px)", lineHeight: 0.95, textTransform: "uppercase", color: ink }}>
              Welcome back,<br /><span style={{ color: accent }}>{profile?.first_name || "Scholar"}</span>
            </h1>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "XP Earned", value: xp, highlight: true },
              { label: "Coins", value: coins, highlight: false },
              { label: "Day Streak", value: streak, highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: "18px 16px" }}>
                <div style={{ fontFamily: anton, fontSize: 36, lineHeight: 1, color: highlight ? accent : ink }}>{value}</div>
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* XP Progress bar */}
          <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: muted }}>Level {level} — Rising Star</span>
              <span style={{ fontFamily: anton, fontSize: 15, color: accent }}>{xp} / {xpForNext} XP</span>
            </div>
            <div style={{ background: line, borderRadius: 999, height: 8, overflow: "hidden" }}>
              <div style={{ background: accent, height: "100%", width: `${xpPct}%`, borderRadius: 999, transition: "width 0.6s ease" }} />
            </div>
            <p style={{ fontSize: 12, color: faint, marginTop: 8 }}>{xpForNext - xp} XP until Level {level + 1}</p>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
              <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: 12 }}>Badges earned</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {badges.map((b) => (
                  <span key={b} style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 999, background: surface2, border: `1px solid ${accent}`, color: accent }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action button */}
          <button className="pb-action-btn" onClick={handleActionReward}
            style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: accent, color: onaccent, border: "none", borderRadius: 999, padding: "14px 28px", cursor: "pointer", transition: "opacity 0.2s" }}>
            Complete action (+25 coins · +50 XP)
          </button>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Continue learning */}
          <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: "18px 20px" }}>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: 14 }}>Continue learning</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COURSES.map((c) => {
                const pct = Math.round((c.done / c.modules) * 100);
                return (
                  <div key={c.id} className="pb-course-row"
                    onClick={() => router.push(`/courses/${c.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 12, background: surface2, border: `1px solid ${line}`, borderRadius: 12, padding: "12px 14px", transition: "border-color 0.15s" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: line, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: ink, marginBottom: 3 }}>{c.name}</div>
                      <div style={{ background: line, borderRadius: 999, height: 4, overflow: "hidden" }}>
                        <div style={{ background: accent, height: "100%", width: `${pct}%`, borderRadius: 999 }} />
                      </div>
                      <div style={{ fontFamily: mono, fontSize: 10, color: faint, marginTop: 3 }}>{c.done}/{c.modules} modules · {pct}%</div>
                    </div>
                    <span style={{ fontSize: 14, color: accent, flexShrink: 0 }}>→</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => router.push("/courses")}
              style={{ width: "100%", marginTop: 12, fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: `1px solid ${line}`, color: muted, borderRadius: 10, padding: "10px", cursor: "pointer" }}>
              View all courses →
            </button>
          </div>

          {/* Recent activity */}
          <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: "18px 20px" }}>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: 14 }}>Recent activity</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {SAMPLE_ACTIVITY.map((a, i) => (
                <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: i < SAMPLE_ACTIVITY.length - 1 ? `1px solid ${line}` : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: onaccent, flexShrink: 0 }}>{a.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, color: ink, lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: faint, marginTop: 3 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
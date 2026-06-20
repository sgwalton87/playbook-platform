"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Notification = {
  id: string;
  type: "xp" | "badge" | "streak" | "course" | "mentor" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "xp",     title: "XP earned!",            body: "You earned +50 XP for completing Module 3 of Captain's Mindset.",     time: "2 hours ago",  read: false },
  { id: "2", type: "badge",  title: "New badge unlocked",     body: "You earned the Scholar badge. Keep pushing!",                          time: "3 hours ago",  read: false },
  { id: "3", type: "streak", title: "7-day streak!",          body: "You've logged in 7 days in a row. Don't break the chain!",             time: "Today",        read: false },
  { id: "4", type: "mentor", title: "Coach Reed left a note", body: "Great work on your leadership module. Ready for the next challenge?",  time: "Yesterday",    read: true  },
  { id: "5", type: "course", title: "New course available",   body: "Voice of a Leader just dropped. Be the first to start it.",            time: "2 days ago",   read: true  },
  { id: "6", type: "xp",    title: "Daily login bonus",       body: "+10 coins and +20 XP added to your account.",                          time: "2 days ago",   read: true  },
  { id: "7", type: "system", title: "Welcome to Playbook!",   body: "Your account is set up. Explore courses, earn XP, and build your playbook.", time: "1 week ago", read: true },
];

const TYPE_CONFIG = {
  xp:     { icon: "⚡", bg: "#2e2016", color: "#ff6a2c", label: "XP" },
  badge:  { icon: "🏅", bg: "#1a2e1a", color: "#1D9E75", label: "Badge" },
  streak: { icon: "🔥", bg: "#2e1a10", color: "#ff6a2c", label: "Streak" },
  course: { icon: "📚", bg: "#1a1e2e", color: "#378ADD", label: "Course" },
  mentor: { icon: "💬", bg: "#2e1a26", color: "#D4537E", label: "Mentor" },
  system: { icon: "★",  bg: "#1a1a1a", color: "#a89a8b", label: "System" },
};

const bg = "#100c0a";
const surface = "#1a1512";
const ink = "#f6f0e7";
const muted = "#a89a8b";
const faint = "#6f6151";
const line = "#332a22";
const accent = "#ff6a2c";
const onaccent = "#170a04";
const mono = "'Space Mono', monospace";
const anton = "'Anton', sans-serif";

export default function NotificationsPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setAuthed(true);
    });
  }, []);

  const markAllRead = () => setNotes((n) => n.map((x) => ({ ...x, read: true })));
  const markRead = (id: string) => setNotes((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));

  const filtered = filter === "unread" ? notes.filter((n) => !n.read) : notes;
  const unreadCount = notes.filter((n) => !n.read).length;

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
        .pb-note:hover { border-color: ${accent} !important; }
      `}</style>

      <header style={{ background: surface, borderBottom: `1px solid ${line}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontFamily: anton, fontSize: 18, color: ink, letterSpacing: "0.02em" }}>PLAYBOOK</span>
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: "0.3em", color: accent }}>SERIES INC.</span>
        </div>
        <nav style={{ display: "flex", gap: 6 }}>
          {[{ label: "Home", path: "/dashboard" }, { label: "Profile", path: "/profile" }, { label: "Courses", path: "/courses" }, { label: "Notifications", path: "/notifications" }].map(({ label, path }) => (
            <button key={label} onClick={() => router.push(path)} className="pb-nav-btn"
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: "none", color: label === "Notifications" ? accent : muted, cursor: "pointer", padding: "8px 12px", borderRadius: 8, position: "relative" }}>
              {label}
              {label === "Notifications" && unreadCount > 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: accent }} />
              )}
            </button>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); router.replace("/"); }}
            style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: `1px solid ${line}`, color: muted, cursor: "pointer", padding: "8px 12px", borderRadius: 999 }}>
            Log out
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Activity</p>
            <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(32px,4vw,48px)", lineHeight: 0.95, textTransform: "uppercase", color: ink }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{ fontFamily: mono, fontSize: 14, background: accent, color: onaccent, borderRadius: 999, padding: "4px 10px", marginLeft: 14, verticalAlign: "middle" }}>{unreadCount} new</span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: `1px solid ${line}`, color: muted, borderRadius: 999, padding: "10px 16px", cursor: "pointer" }}>
              Mark all read
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["all", "unread"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: filter === f ? accent : "transparent", color: filter === f ? onaccent : muted, border: `1px solid ${filter === f ? accent : line}`, borderRadius: 999, padding: "8px 16px", cursor: "pointer", transition: "all 0.15s" }}>
              {f === "all" ? `All (${notes.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: "40px", textAlign: "center" }}>
            <p style={{ fontFamily: mono, fontSize: 12, color: faint, letterSpacing: "0.08em" }}>No notifications here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((n) => {
              const cfg = TYPE_CONFIG[n.type];
              return (
                <div key={n.id} className="pb-note" onClick={() => markRead(n.id)}
                  style={{ display: "flex", gap: 14, alignItems: "flex-start", background: n.read ? surface : "#1e1510", border: `1px solid ${n.read ? line : accent + "55"}`, borderRadius: 16, padding: "16px 18px", cursor: "pointer", transition: "border-color 0.15s", position: "relative" }}>
                  {!n.read && <div style={{ position: "absolute", top: 16, right: 16, width: 8, height: 8, borderRadius: "50%", background: accent }} />}
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cfg.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: cfg.color, background: cfg.bg, padding: "2px 7px", borderRadius: 999 }}>{cfg.label}</span>
                      <span style={{ fontFamily: mono, fontSize: 10, color: faint }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, color: n.read ? muted : ink, marginBottom: 4 }}>{n.title}</p>
                    <p style={{ fontSize: 13, color: faint, lineHeight: 1.5 }}>{n.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

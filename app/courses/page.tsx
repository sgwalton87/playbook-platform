"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Course = {
  id: string;
  icon: string;
  title: string;
  pillar: string;
  pillarColor: string;
  desc: string;
  modules: number;
  done: number;
  available: boolean;
};

const ALL_COURSES: Course[] = [
  { id: "captains-mindset", icon: "★", title: "Captain's Mindset", pillar: "Leadership", pillarColor: "#ff6a2c", desc: "Lead by example on and off the court with proven captaincy frameworks.", modules: 6, done: 3, available: true },
  { id: "money-in-the-game", icon: "$", title: "Money in the Game", pillar: "Finance", pillarColor: "#1D9E75", desc: "Budgeting, saving, and the fundamentals of NIL for young athletes.", modules: 8, done: 1, available: true },
  { id: "mind-of-an-athlete", icon: "♥", title: "Mind of an Athlete", pillar: "SEL", pillarColor: "#D4537E", desc: "Build resilience and manage pressure with social-emotional tools.", modules: 5, done: 0, available: true },
  { id: "community-leader", icon: "✓", title: "Community Leader", pillar: "Civic", pillarColor: "#378ADD", desc: "Youth-led projects, advocacy, and recognition for leaders who create change.", modules: 6, done: 0, available: false },
  { id: "public-speaking", icon: "★", title: "Voice of a Leader", pillar: "Leadership", pillarColor: "#ff6a2c", desc: "Communicate with confidence in the classroom, on the court, and in life.", modules: 4, done: 0, available: false },
  { id: "credit-and-debt", icon: "$", title: "Credit & Debt 101", pillar: "Finance", pillarColor: "#1D9E75", desc: "Understand credit scores, debt, and how to build a strong financial foundation.", modules: 5, done: 0, available: false },
];

const FILTERS = ["All", "Leadership", "Finance", "Civic", "SEL"];

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

export default function CoursesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setAuthed(true);
    });
  }, []);

  const filtered = ALL_COURSES.filter((c) =>
    filter === "All" ? true : c.pillar === filter
  );

  const inProgress = ALL_COURSES.filter((c) => c.done > 0 && c.done < c.modules);
  const completed = ALL_COURSES.filter((c) => c.done === c.modules && c.modules > 0);

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
        .pb-course-card:hover { border-color: ${accent} !important; transform: translateY(-2px); }
        .pb-filter:hover { border-color: ${muted} !important; color: ${ink} !important; }
      `}</style>

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
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: "none", color: label === "Courses" ? accent : muted, cursor: "pointer", padding: "8px 12px", borderRadius: 8 }}>
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
          <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>The library</p>
          <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(32px,4vw,52px)", lineHeight: 0.95, textTransform: "uppercase", color: ink }}>
            Learn like a <span style={{ color: accent }}>starter</span>
          </h1>
        </div>

        {/* In progress strip */}
        {inProgress.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: 12 }}>In progress</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {inProgress.map((c) => {
                const pct = Math.round((c.done / c.modules) * 100);
                return (
                  <div key={c.id}
                    onClick={() => router.push(`/courses/${c.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 14, background: surface, border: `1px solid ${line}`, borderRadius: 14, padding: "14px 18px", cursor: "pointer" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: c.pillarColor, flexShrink: 0 }}>{c.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: ink }}>{c.title}</span>
                        <span style={{ fontFamily: mono, fontSize: 11, color: c.pillarColor }}>{pct}%</span>
                      </div>
                      <div style={{ background: line, borderRadius: 999, height: 5, overflow: "hidden" }}>
                        <div style={{ background: c.pillarColor, height: "100%", width: `${pct}%`, borderRadius: 999 }} />
                      </div>
                      <div style={{ fontFamily: mono, fontSize: 10, color: faint, marginTop: 4 }}>{c.done} of {c.modules} modules complete</div>
                    </div>
                    <span style={{ fontSize: 14, color: accent, flexShrink: 0 }}>→</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="pb-filter"
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: filter === f ? accent : "transparent", color: filter === f ? onaccent : muted, border: `1px solid ${filter === f ? accent : line}`, borderRadius: 999, padding: "8px 16px", cursor: "pointer", transition: "all 0.15s" }}>
              {f}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16, marginBottom: 32 }}>
          {filtered.map((c) => {
            const pct = Math.round((c.done / c.modules) * 100);
            const isComplete = c.done === c.modules && c.modules > 0;
            return (
              <div key={c.id}
                className={c.available ? "pb-course-card" : ""}
                onClick={() => c.available && router.push(`/courses/${c.id}`)}
                style={{ background: surface, border: `1px solid ${c.available ? line : surface}`, borderRadius: 18, overflow: "hidden", transition: "border-color 0.2s, transform 0.2s", cursor: c.available ? "pointer" : "default", opacity: c.available ? 1 : 0.45 }}>

                {/* Card top */}
                <div style={{ background: surface2, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: c.pillarColor, borderBottom: `1px solid ${line}`, position: "relative" }}>
                  {c.icon}
                  <span style={{ position: "absolute", top: 10, left: 12, fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: c.pillarColor, color: onaccent, padding: "3px 8px", borderRadius: 999 }}>
                    {c.pillar}
                  </span>
                  {isComplete && (
                    <span style={{ position: "absolute", top: 10, right: 12, fontFamily: mono, fontSize: 9, fontWeight: 700, background: "#1D9E75", color: "#04342C", padding: "3px 8px", borderRadius: 999 }}>
                      Complete
                    </span>
                  )}
                  {!c.available && (
                    <span style={{ position: "absolute", top: 10, right: 12, fontFamily: mono, fontSize: 9, fontWeight: 700, background: line, color: faint, padding: "3px 8px", borderRadius: 999 }}>
                      Coming soon
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: "18px 18px 20px" }}>
                  <h3 style={{ fontFamily: anton, fontWeight: 400, fontSize: 20, textTransform: "uppercase", letterSpacing: "0.01em", color: ink, marginBottom: 8 }}>{c.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: muted, marginBottom: 14 }}>{c.desc}</p>
                  <div style={{ borderTop: `1px solid ${line}`, paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: mono, fontSize: 10, color: faint }}>{c.modules} modules</span>
                    {c.available && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>
                        {c.done === 0 ? "Start →" : isComplete ? "Review →" : `Continue (${pct}%) →`}
                      </span>
                    )}
                  </div>
                  {c.done > 0 && !isComplete && (
                    <div style={{ background: line, borderRadius: 999, height: 4, marginTop: 10, overflow: "hidden" }}>
                      <div style={{ background: c.pillarColor, height: "100%", width: `${pct}%`, borderRadius: 999 }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats footer */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "Courses available", value: ALL_COURSES.filter(c => c.available).length },
            { label: "In progress", value: inProgress.length },
            { label: "Completed", value: completed.length },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: surface, border: `1px solid ${line}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontFamily: anton, fontSize: 28, color: ink }}>{value}</div>
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: muted, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
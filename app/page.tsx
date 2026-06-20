"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// ─── Theme System ────────────────────────────────────────────────────────────
const THEMES = {
  court: {
    bg: "#100c0a", surface: "#1a1512", surface2: "#241c16",
    ink: "#f6f0e7", muted: "#a89a8b", faint: "#6f6151",
    faint2: "#2c241d", line: "#332a22",
    accent: "#ff6a2c", onaccent: "#170a04",
  },
  chalk: {
    bg: "#0d0f12", surface: "#14171c", surface2: "#1c2026",
    ink: "#eef1f5", muted: "#94a0ae", faint: "#5d6875",
    faint2: "#222831", line: "#28303a",
    accent: "#ff5a3c", onaccent: "#0d0f12",
  },
  cream: {
    bg: "#f5efe6", surface: "#ece4d6", surface2: "#e3d9c8",
    ink: "#1c150f", muted: "#6b5d4c", faint: "#9b8a73",
    faint2: "#d8cdbb", line: "#d7cbb8",
    accent: "#e8341a", onaccent: "#fff7ef",
  },
};

type ThemeKey = keyof typeof THEMES;

const NAV = ["About", "Pillars", "Programs", "Impact", "Team", "Blog"];

const PILLARS = [
  { num: "01", icon: "★", title: "Leadership", desc: "Captaincy, accountability, and the confidence to lead a locker room and a classroom." },
  { num: "02", icon: "$", title: "Financial Literacy", desc: "Money management, NIL basics, and building wealth that outlasts a career." },
  { num: "03", icon: "✓", title: "Academic Accountability", desc: "Study habits, eligibility, and staying on track for graduation and college." },
  { num: "04", icon: "♥", title: "Social-Emotional Learning", desc: "Identity, resilience, and mental wellness through every transition." },
];

const COURSES = [
  { tag: "Leadership", img: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=900&q=80", title: "Captain's Mindset", desc: "Lead by example on and off the court with proven captaincy frameworks.", meta: "6 modules · self-paced" },
  { tag: "Finance", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80", title: "Money in the Game", desc: "Budgeting, saving, and the fundamentals of NIL for young athletes.", meta: "8 modules · self-paced" },
  { tag: "Wellness", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80", title: "Mind of an Athlete", desc: "Build resilience and manage pressure with social-emotional tools.", meta: "5 modules · self-paced" },
];

const STATS = [
  { value: "4", label: "Pillars guiding every program" },
  { value: "1,200+", label: "Scholar-athletes in the network" },
  { value: "92%", label: "Report stronger confidence" },
  { value: "18", label: "Partner schools & hubs" },
];

const STEPS = [
  { num: "1", title: "Join the network", desc: "Create a profile, connect with teammates, mentors, and coaches across the platform." },
  { num: "2", title: "Run the courses", desc: "Work through e-learning modules built around the four pillars at your own pace." },
  { num: "3", title: "Level up", desc: "Earn badges, track growth on your record, and unlock workforce-readiness opportunities." },
];

const TEAM = [
  { name: "Coach J. Reed", role: "Founder & ED", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
  { name: "M. Alvarez", role: "Head of Curriculum", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80" },
  { name: "T. Okafor", role: "Community Lead", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80" },
  { name: "S. Nguyen", role: "Product & Tech", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80" },
];

const POSTS = [
  { cat: "Leadership", img: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900&q=80", title: "Why captains are made, not born", excerpt: "The habits that turn a talented player into a trusted leader." },
  { cat: "Finance", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80", title: "NIL 101 for the under-18 athlete", excerpt: "What young athletes and families should know before signing anything." },
  { cat: "Wellness", img: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=900&q=80", title: "Handling the pressure of the big game", excerpt: "Simple mental tools scholar-athletes can use in the clutch." },
];

const TICKER = "RUN IT! ★ SCHOLAR-ATHLETES AGES 11–18 ★ OAKLAND, CALIFORNIA ★ ON & OFF THE COURT ★ THE ED-TECH SOLUTION ★ ";

export default function HomePage() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeKey>("court");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [authed, setAuthed] = useState(false);

  const t = THEMES[theme];

  // ── CHANGE 1: Check auth AND listen for sign in/out in real time ──────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setAuthed(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // ── CHANGE 2: CTA form sends to /login (your existing signup/login page) ──
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  // ── CHANGE 3: Logout handler for nav ─────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  const root: React.CSSProperties = {
    background: t.bg,
    color: t.ink,
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    overflowX: "hidden",
    minHeight: "100vh",
  };

  const mono = "'Space Mono', monospace";
  const anton = "'Anton', sans-serif";
  const pad = "clamp(18px, 5vw, 56px)";
  const maxW = "1280px";
  const inner: React.CSSProperties = { maxWidth: maxW, margin: "0 auto", padding: `0 ${pad}` };

  return (
    <div style={root}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        ::selection { background: ${t.accent}; color: ${t.onaccent}; }
        @keyframes pbMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .pb-navlink:hover { color: ${t.ink} !important; background: ${t.surface} !important; }
        .pb-pillar:hover { transform: translateY(-4px); border-color: ${t.accent} !important; }
        .pb-course:hover { transform: translateY(-4px); }
      `}</style>

      {/* ── NAV ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${t.bg}d9`,
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${t.line}`,
      }}>
        <div style={{ ...inner, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: `13px ${pad}` }}>
          <div onClick={() => scrollTo("top")} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/pb-logo-framed.png" alt="Playbook" style={{ height: 48, width: "auto", borderRadius: 10 }} />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 0.94 }}>
              <span style={{ fontFamily: anton, fontSize: 18, letterSpacing: "0.02em", color: t.ink }}>PLAYBOOK</span>
              <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.32em", color: t.accent }}>SERIES INC.</span>
            </span>
          </div>

          {/* ── CHANGE 1 reflected here: 3 states — guest / authed ── */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV.map((n) => (
              <button key={n} onClick={() => scrollTo(n.toLowerCase())}
                className="pb-navlink"
                style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: t.muted, background: "transparent", border: "none", cursor: "pointer", padding: "9px 13px", borderRadius: 8, letterSpacing: "0.01em" }}>
                {n}
              </button>
            ))}

            {authed ? (
              // Logged in: show Dashboard + Log Out
              <>
                <button onClick={() => router.push("/dashboard")}
                  style={{ marginLeft: 10, fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: t.accent, color: t.onaccent, border: "none", borderRadius: 999, padding: "11px 17px", cursor: "pointer" }}>
                  Dashboard →
                </button>
                <button onClick={handleLogout}
                  style={{ marginLeft: 6, fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", color: t.muted, border: `1px solid ${t.line}`, borderRadius: 999, padding: "11px 17px", cursor: "pointer" }}>
                  Log Out
                </button>
              </>
            ) : (
              // Logged out: show Log In + Sign Up
              <>
                <button onClick={() => router.push("/login")}
                  style={{ marginLeft: 10, fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", color: t.muted, border: `1px solid ${t.line}`, borderRadius: 999, padding: "11px 17px", cursor: "pointer" }}>
                  Log In
                </button>
                <button onClick={() => router.push("/login")}
                  style={{ marginLeft: 6, fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: t.accent, color: t.onaccent, border: "none", borderRadius: 999, padding: "11px 17px", cursor: "pointer" }}>
                  Sign Up Free
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── TICKER ── */}
      <div style={{ background: t.accent, color: t.onaccent, overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", animation: "pbMarquee 28s linear infinite", fontFamily: anton, fontSize: 13.5, letterSpacing: "0.16em", padding: "8px 0" }}>
          <span style={{ padding: "0 22px" }}>{TICKER}</span>
          <span style={{ padding: "0 22px" }}>{TICKER}</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section id="top" style={{ ...inner, padding: `clamp(48px,7vw,96px) ${pad}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.06fr 0.94fr", gap: "clamp(28px,5vw,64px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: mono, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, marginBottom: 24 }}>
              <span style={{ width: 26, height: 2, background: t.accent, display: "inline-block" }} />
              The ed-tech solution
            </div>
            <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(42px,6.4vw,90px)", lineHeight: 0.92, letterSpacing: "0.005em", margin: "0 0 22px", color: t.ink, textTransform: "uppercase" }}>
              Thrive on <span style={{ color: t.accent }}>&</span> off<br />the court.
            </h1>
            <p style={{ fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.5, color: t.muted, maxWidth: "34ch", margin: "0 0 32px" }}>
              The only platform that combines social networking with e-learning — building the next generation of leaders through sport.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {/* ── CHANGE 2 reflected: hero buttons go to /login ── */}
              <button onClick={() => router.push("/login")}
                style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: t.accent, color: t.onaccent, border: "none", borderRadius: 999, padding: "15px 26px", cursor: "pointer" }}>
                Join the Network
              </button>
              <button onClick={() => scrollTo("programs")}
                style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: "transparent", color: t.ink, border: `1.5px solid ${t.line}`, borderRadius: 999, padding: "15px 26px", cursor: "pointer" }}>
                Explore Courses
              </button>
            </div>
            <div style={{ display: "flex", gap: 30, marginTop: 44 }}>
              {[["4", "Core pillars"], ["11–18", "Ages served"], ["510", "Oakland, CA"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontFamily: anton, fontSize: 34, color: t.ink }}>{val}</div>
                  <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: t.muted }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 22, overflow: "hidden", border: `1px solid ${t.line}`, aspectRatio: "4/5", position: "relative", background: t.surface }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=1000&q=80" alt="Scholar-athletes" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,7,6,0) 45%, rgba(10,7,6,.78) 100%)" }} />
              <div style={{ position: "absolute", left: 16, bottom: 16, right: 16, background: "rgba(10,7,6,.62)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: anton, fontSize: 15, color: "#f6f0e7", letterSpacing: "0.02em" }}>RUN IT!</div>
                  <div style={{ fontSize: 11.5, color: "#d8ccbe" }}>Network + courses in one app</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 999, background: t.accent, color: t.onaccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▶</div>
              </div>
            </div>
            <div style={{ position: "absolute", top: 32, left: -20, background: t.surface2, border: `1px solid ${t.line}`, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: t.accent }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.ink }}>+1,200 scholars</div>
                <div style={{ fontSize: 10.5, color: t.muted }}>in the network</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`, background: t.surface }}>
        <div style={{ ...inner, padding: `22px ${pad}`, display: "flex", alignItems: "center", gap: "clamp(18px,4vw,52px)", flexWrap: "wrap", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: t.muted }}>Trusted by schools & partners</span>
          {["OUSD", "East Bay", "NCAA Prep", "YMCA", "Title I"].map((p) => (
            <span key={p} style={{ fontFamily: anton, fontSize: "clamp(15px,1.5vw,20px)", letterSpacing: "0.04em", color: t.faint, textTransform: "uppercase" }}>{p}</span>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ ...inner, padding: `clamp(56px,8vw,104px) ${pad}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: "clamp(28px,5vw,64px)", alignItems: "start" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, marginBottom: 16 }}>01 / Who we are</div>
            <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(30px,3.6vw,50px)", lineHeight: 1.02, margin: 0, color: t.ink, textTransform: "uppercase" }}>More than a game plan</h2>
          </div>
          <div>
            <p style={{ fontSize: "clamp(17px,1.5vw,21px)", lineHeight: 1.55, color: t.ink, margin: "0 0 20px" }}>
              Playbook Series, Inc. is an Oakland-based ed-tech nonprofit that meets young people where they already are — in the game.
            </p>
            <p style={{ fontSize: "clamp(15px,1.3vw,17px)", lineHeight: 1.6, color: t.muted, margin: "0 0 28px" }}>
              We combine the connection of social networking with the rigor of e-learning, supporting scholar-athletes through the transitions of adolescence, age, and into the workforce. The result: confident leaders, on and off the court.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["Social networking", "E-learning", "Mentorship", "Workforce-ready"].map((tag) => (
                <span key={tag} style={{ fontSize: 13, fontWeight: 600, color: t.ink, background: t.surface2, border: `1px solid ${t.line}`, padding: "9px 15px", borderRadius: 999 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section id="pillars" style={{ background: t.surface, borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
        <div style={{ ...inner, padding: `clamp(56px,8vw,104px) ${pad}` }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 42 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, marginBottom: 16 }}>02 / The framework</div>
              <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(30px,3.8vw,54px)", lineHeight: 1, margin: 0, color: t.ink, textTransform: "uppercase" }}>Four pillars of the playbook</h2>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: t.muted, maxWidth: "38ch", margin: 0 }}>Every course, mentor session, and challenge maps back to one of four pillars that build the whole person.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {PILLARS.map((p) => (
              <div key={p.num} className="pb-pillar" style={{ position: "relative", background: t.bg, border: `1px solid ${t.line}`, borderRadius: 18, padding: "26px 22px 30px", overflow: "hidden", transition: "transform .25s ease, border-color .25s ease", cursor: "pointer" }}>
                <div style={{ fontFamily: anton, fontSize: "clamp(40px,4vw,58px)", lineHeight: 1, color: t.faint2, marginBottom: "auto" }}>{p.num}</div>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: t.accent, color: t.onaccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "22px 0 18px" }}>{p.icon}</div>
                <h3 style={{ fontFamily: anton, fontWeight: 400, fontSize: 19, letterSpacing: "0.01em", textTransform: "uppercase", color: t.ink, margin: "0 0 10px" }}>{p.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: t.muted, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section id="programs" style={{ ...inner, padding: `clamp(56px,8vw,104px) ${pad}` }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 42 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, marginBottom: 16 }}>03 / The courses</div>
            <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(30px,3.8vw,54px)", lineHeight: 1, margin: 0, color: t.ink, textTransform: "uppercase" }}>Learn like a starter</h2>
          </div>
          <button onClick={() => router.push("/login")} style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", color: t.accent, border: "none", cursor: "pointer" }}>View all courses →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {COURSES.map((c) => (
            <div key={c.title} className="pb-course" onClick={() => router.push("/login")} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 20, overflow: "hidden", transition: "transform .25s ease", cursor: "pointer" }}>
              <div style={{ position: "relative", aspectRatio: "16/10", background: t.surface2, overflow: "hidden", borderBottom: `1px solid ${t.line}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", top: 14, left: 14, fontFamily: mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: t.accent, color: t.onaccent, padding: "6px 11px", borderRadius: 999 }}>{c.tag}</span>
              </div>
              <div style={{ padding: 22 }}>
                <h3 style={{ fontFamily: anton, fontWeight: 400, fontSize: 21, letterSpacing: "0.01em", textTransform: "uppercase", color: t.ink, margin: "0 0 9px" }}>{c.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: t.muted, margin: "0 0 18px" }}>{c.desc}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${t.line}`, paddingTop: 14 }}>
                  <span style={{ fontFamily: mono, fontSize: 11, color: t.muted }}>{c.meta}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>Start →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── IMPACT STATS ── */}
      <section id="impact" style={{ position: "relative", background: t.accent, color: t.onaccent, overflow: "hidden" }}>
        <div style={{ ...inner, padding: `clamp(56px,8vw,100px) ${pad}`, position: "relative" }}>
          <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.7, marginBottom: 16 }}>04 / The scoreboard</div>
          <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(30px,4vw,56px)", lineHeight: 1, margin: "0 0 48px", textTransform: "uppercase", maxWidth: "18ch" }}>Real growth, kept on the record</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ borderTop: `2px solid rgba(255,255,255,0.3)`, paddingTop: 18 }}>
                <div style={{ fontFamily: anton, fontSize: "clamp(40px,5vw,72px)", lineHeight: 0.92 }}>{s.value}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8, maxWidth: "20ch" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ ...inner, padding: `clamp(56px,8vw,104px) ${pad}` }}>
        <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, marginBottom: 16 }}>05 / The play</div>
        <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(30px,3.8vw,54px)", lineHeight: 1, margin: "0 0 44px", color: t.ink, textTransform: "uppercase" }}>How the network runs</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {STEPS.map((s) => (
            <div key={s.num} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18, padding: "28px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{ fontFamily: anton, fontSize: 22, color: t.onaccent, background: t.accent, width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.num}</div>
                <h3 style={{ fontFamily: anton, fontWeight: 400, fontSize: 19, textTransform: "uppercase", letterSpacing: "0.01em", color: t.ink, margin: 0 }}>{s.title}</h3>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: t.muted, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" style={{ background: t.surface, borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
        <div style={{ ...inner, padding: `clamp(56px,8vw,104px) ${pad}` }}>
          <div style={{ marginBottom: 42 }}>
            <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, marginBottom: 16 }}>06 / The coaches</div>
            <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(30px,3.8vw,54px)", lineHeight: 1, margin: 0, color: t.ink, textTransform: "uppercase" }}>Built by the team</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {TEAM.map((m) => (
              <div key={m.name} style={{ background: t.bg, border: `1px solid ${t.line}`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ aspectRatio: "1/1", overflow: "hidden", borderBottom: `1px solid ${t.line}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.img} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "18px 18px 22px" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: t.ink, margin: "0 0 4px" }}>{m.name}</h3>
                  <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: t.accent, margin: 0 }}>{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section id="blog" style={{ ...inner, padding: `clamp(56px,8vw,104px) ${pad}` }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 42 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, marginBottom: 16 }}>07 / From the bench</div>
            <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(30px,3.8vw,54px)", lineHeight: 1, margin: 0, color: t.ink, textTransform: "uppercase" }}>Latest from the blog</h2>
          </div>
          <button style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", color: t.accent, border: "none", cursor: "pointer" }}>All posts →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {POSTS.map((b) => (
            <div key={b.title} className="pb-course" style={{ border: `1px solid ${t.line}`, borderRadius: 18, overflow: "hidden", background: t.surface, transition: "transform .25s ease", cursor: "pointer" }}>
              <div style={{ aspectRatio: "16/9", overflow: "hidden", borderBottom: `1px solid ${t.line}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.img} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: t.accent, marginBottom: 10 }}>{b.cat}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25, color: t.ink, margin: "0 0 8px" }}>{b.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: t.muted, margin: 0 }}>{b.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── JOIN / CTA ── */}
      <section id="join" style={{ ...inner, padding: `0 ${pad} clamp(56px,8vw,96px)` }}>
        <div style={{ position: "relative", background: t.surface2, border: `1px solid ${t.line}`, borderRadius: 28, overflow: "hidden", padding: "clamp(40px,6vw,80px) clamp(24px,5vw,72px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 40, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, marginBottom: 18 }}>Ready to elevate?</div>
              <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(34px,4.6vw,66px)", lineHeight: 0.96, margin: "0 0 20px", color: t.ink, textTransform: "uppercase" }}>Get in the game today</h2>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: t.muted, maxWidth: "42ch", margin: 0 }}>Join a network of scholar-athletes, mentors, and educators building something that lasts beyond the final buzzer.</p>
            </div>
            {/* ── CHANGE 2: CTA section routes to /login ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => router.push("/login")}
                style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: t.accent, color: t.onaccent, border: "none", borderRadius: 12, padding: "18px", cursor: "pointer" }}>
                Sign Up Free
              </button>
              <button onClick={() => router.push("/login")}
                style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", color: t.ink, border: `1.5px solid ${t.line}`, borderRadius: 12, padding: "18px", cursor: "pointer" }}>
                Log In
              </button>
              <span style={{ fontSize: 12, color: t.muted, textAlign: "center" }}>
                Free to join · scholar-athletes ages 11–18
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${t.line}`, background: t.surface }}>
        <div style={{ ...inner, padding: `clamp(40px,5vw,64px) ${pad} 36px` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/pb-logo-framed.png" alt="Playbook" style={{ height: 52, width: "auto", borderRadius: 10 }} />
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 0.94 }}>
                  <span style={{ fontFamily: anton, fontSize: 18, color: t.ink }}>PLAYBOOK</span>
                  <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.32em", color: t.accent }}>SERIES INC.</span>
                </span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: t.muted, maxWidth: "34ch", margin: 0 }}>
                Combining social networking with e-learning to help scholar-athletes thrive on and off the court. Oakland, California.
              </p>
            </div>
            {[
              { head: "Platform", links: ["Join the Network", "Explore Courses", "The Four Pillars", "For Schools"] },
              { head: "Company", links: ["About Us", "Our Team", "Blog", "Contact"] },
              { head: "Connect", links: ["Instagram", "TikTok", "LinkedIn", "YouTube"] },
            ].map((col) => (
              <div key={col.head}>
                <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: t.faint, marginBottom: 14 }}>{col.head}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l) => (
                    <a key={l} href="#" style={{ fontSize: 13.5, color: t.muted, textDecoration: "none" }}>{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${t.line}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13, color: t.faint }}>© 2025 Playbook Series, Inc. All rights reserved.</span>
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.1em", color: t.accent }}>RUN IT! ★</span>
          </div>
        </div>
      </footer>

      {/* ── THEME SWITCHER ── */}
      <div style={{ position: "fixed", left: "50%", bottom: 22, transform: "translateX(-50%)", zIndex: 80, display: "flex", alignItems: "center", gap: 6, background: `${t.bg}cc`, backdropFilter: "blur(14px)", border: `1px solid ${t.line}`, borderRadius: 999, padding: 6 }}>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: t.muted, padding: "0 8px" }}>Look</span>
        {(["court", "chalk", "cream"] as ThemeKey[]).map((k) => (
          <button key={k} onClick={() => setTheme(k)}
            style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 999, padding: "8px 15px", background: theme === k ? t.accent : "transparent", color: theme === k ? t.onaccent : t.muted, transition: "all 0.2s" }}>
            {k}
          </button>
        ))}
      </div>

    </div>
  );
}
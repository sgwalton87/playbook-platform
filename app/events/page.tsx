"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Event = {
  id: string;
  title: string;
  type: "workshop" | "lab" | "civic" | "social" | "virtual";
  pillar: string;
  pillarColor: string;
  date: string;
  time: string;
  location: string;
  host: string;
  hostInitials: string;
  hostColor: string;
  spots: number;
  spotsLeft: number;
  xpReward: number;
  coinReward: number;
  description: string;
  rsvp: "going" | "interested" | null;
};

const EVENTS: Event[] = [
  {
    id: "1", title: "Leadership Lab: Captains Only", type: "lab", pillar: "Leadership", pillarColor: "#ff6a2c",
    date: "Sat, Jun 22", time: "10:00 AM – 12:00 PM", location: "Oakland Tech · Room 204", host: "Coach J. Reed", hostInitials: "JR", hostColor: "#ff6a2c",
    spots: 20, spotsLeft: 6, xpReward: 150, coinReward: 30, rsvp: "going",
    description: "An intensive workshop on captaincy, team accountability, and leading through adversity. Certificate awarded on completion."
  },
  {
    id: "2", title: "Financial Game Plan: NIL 101", type: "workshop", pillar: "Finance", pillarColor: "#1D9E75",
    date: "Wed, Jun 25", time: "5:00 PM – 6:30 PM", location: "Virtual · Zoom", host: "M. Alvarez", hostInitials: "MA", hostColor: "#1D9E75",
    spots: 50, spotsLeft: 34, xpReward: 100, coinReward: 20, rsvp: null,
    description: "Everything scholars and families need to know before signing LegacyValue NIL deal. Budgeting basics included."
  },
  {
    id: "3", title: "Youth Civic Action Day", type: "civic", pillar: "Civic", pillarColor: "#378ADD",
    date: "Fri, Jun 27", time: "9:00 AM – 3:00 PM", location: "City Hall, Oakland", host: "T. Okafor", hostInitials: "TO", hostColor: "#378ADD",
    spots: 40, spotsLeft: 12, xpReward: 200, coinReward: 50, rsvp: "interested",
    description: "A full-day civic engagement experience. Scholars will meet city leaders, present a community project, and earn recognition awards."
  },
  {
    id: "4", title: "Mind & Body Wellness Circle", type: "social", pillar: "SEL", pillarColor: "#D4537E",
    date: "Thu, Jun 26", time: "6:00 PM – 7:00 PM", location: "Virtual · Zoom", host: "S. Nguyen", hostInitials: "SN", hostColor: "#D4537E",
    spots: 15, spotsLeft: 9, xpReward: 75, coinReward: 15, rsvp: null,
    description: "A safe space for scholars to talk about mental health, pressure, and personal growth. No agenda — just honest conversation."
  },
  {
    id: "5", title: "Scholar-Athlete Network Mixer", type: "social", pillar: "Leadership", pillarColor: "#ff6a2c",
    date: "Sat, Jul 12", time: "2:00 PM – 5:00 PM", location: "Playbook HQ · Oakland", host: "Coach J. Reed", hostInitials: "JR", hostColor: "#ff6a2c",
    spots: 75, spotsLeft: 41, xpReward: 125, coinReward: 25, rsvp: null,
    description: "Meet other scholar-athletes, mentors, and partners in the network. Bring your story and leave with new connections."
  },
  {
    id: "6", title: "Credit & Debt Masterclass", type: "workshop", pillar: "Finance", pillarColor: "#1D9E75",
    date: "Sat, Jul 19", time: "11:00 AM – 1:00 PM", location: "Virtual · Zoom", host: "M. Alvarez", hostInitials: "MA", hostColor: "#1D9E75",
    spots: 60, spotsLeft: 60, xpReward: 100, coinReward: 20, rsvp: null,
    description: "Understand credit scores, how to build credit as a young athlete, and avoid the debt traps that end careers early."
  },
];

const TYPE_LABELS: Record<string, string> = {
  workshop: "Workshop", lab: "Lab", civic: "Civic", social: "Social", virtual: "Virtual"
};

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

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(EVENTS);
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState<"all" | "mine">("all");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setAuthed(true);
    });
  }, [router]);

  const setRSVP = (id: string, status: "going" | "interested" | null) => {
    setEvents((e) => e.map((ev) => ev.id === id
      ? { ...ev, rsvp: ev.rsvp === status ? null : status, spotsLeft: ev.rsvp === "going" && status !== "going" ? ev.spotsLeft + 1 : ev.rsvp !== "going" && status === "going" ? ev.spotsLeft - 1 : ev.spotsLeft }
      : ev
    ));
  };

  const filtered = events
    .filter((e) => filter === "All" ? true : e.pillar === filter)
    .filter((e) => view === "mine" ? e.rsvp !== null : true);

  const myEvents = events.filter((e) => e.rsvp !== null);

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
          {[{ label: "Home", path: "/dashboard" }, { label: "Feed", path: "/feed" }, { label: "Events", path: "/events" }, { label: "Mentorship", path: "/mentorship" }].map(({ label, path }) => (
            <button key={label} onClick={() => router.push(path)} className="pb-nav-btn"
              style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: "none", color: label === "Events" ? accent : muted, cursor: "pointer", padding: "8px 12px", borderRadius: 8 }}>
              {label}
            </button>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); router.replace("/"); }}
            style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "transparent", border: `1px solid ${line}`, color: muted, cursor: "pointer", padding: "8px 12px", borderRadius: 999 }}>
            Log out
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>

        {/* LEFT */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>What&apos;s happening</p>
            <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(32px,4vw,52px)", lineHeight: 0.95, textTransform: "uppercase", color: ink, marginBottom: 16 }}>
              Upcoming <span style={{ color: accent }}>events</span>
            </h1>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {(["all", "mine"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: view === v ? accent : "transparent", color: view === v ? onaccent : muted, border: `1px solid ${view === v ? accent : line}`, borderRadius: 999, padding: "8px 16px", cursor: "pointer", transition: "all 0.15s" }}>
                  {v === "all" ? "All events" : `My events (${myEvents.length})`}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: filter === f ? surface2 : "transparent", color: filter === f ? ink : faint, border: `1px solid ${filter === f ? line : "transparent"}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer", transition: "all 0.15s" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.length === 0 ? (
              <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: 40, textAlign: "center" }}>
                <p style={{ fontFamily: mono, fontSize: 12, color: faint, letterSpacing: "0.08em" }}>No events found.</p>
              </div>
            ) : filtered.map((ev) => {
              const full = ev.spotsLeft === 0 && ev.rsvp !== "going";
              return (
                <div key={ev.id} className="pb-card"
                  style={{ background: surface, border: `1px solid ${ev.rsvp ? accent + "44" : line}`, borderRadius: 18, padding: "22px 24px", transition: "border-color 0.15s" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "flex-start" }}>
                    <div>
                      {/* Tags row */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ev.pillarColor, background: surface2, padding: "3px 8px", borderRadius: 999 }}>{ev.pillar}</span>
                        <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, background: surface2, padding: "3px 8px", borderRadius: 999 }}>{TYPE_LABELS[ev.type]}</span>
                        {ev.rsvp === "going" && <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1D9E75", background: "#0a1f0a", padding: "3px 8px", borderRadius: 999 }}>Going</span>}
                        {ev.rsvp === "interested" && <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#378ADD", background: "#0a1020", padding: "3px 8px", borderRadius: 999 }}>Interested</span>}
                      </div>
                      <h2 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(18px,2.5vw,26px)", textTransform: "uppercase", color: ink, marginBottom: 10 }}>{ev.title}</h2>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: muted, marginBottom: 14 }}>{ev.description}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                        {[
                          { label: "Date", val: ev.date },
                          { label: "Time", val: ev.time },
                          { label: "Location", val: ev.location },
                          { label: "Host", val: ev.host },
                        ].map(({ label, val }) => (
                          <div key={label}>
                            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: faint, marginBottom: 2 }}>{label}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: ink }}>{val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ fontFamily: mono, fontSize: 10, color: accent }}>+{ev.xpReward} XP</span>
                        <span style={{ fontFamily: mono, fontSize: 10, color: accent }}>+{ev.coinReward} coins</span>
                        <span style={{ fontFamily: mono, fontSize: 10, color: full ? "#A32D2D" : faint }}>{full ? "FULL" : `${ev.spotsLeft} spots left`}</span>
                      </div>
                    </div>

                    {/* RSVP buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 120 }}>
                      <button onClick={() => setRSVP(ev.id, "going")}
                        style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: ev.rsvp === "going" ? "#1D9E75" : "transparent", color: ev.rsvp === "going" ? "#04342C" : muted, border: `1px solid ${ev.rsvp === "going" ? "#1D9E75" : line}`, borderRadius: 999, padding: "10px 14px", cursor: "pointer", transition: "all 0.15s" }}>
                        {ev.rsvp === "going" ? "Going ✓" : "Going"}
                      </button>
                      <button onClick={() => setRSVP(ev.id, "interested")}
                        style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: ev.rsvp === "interested" ? "#378ADD" : "transparent", color: ev.rsvp === "interested" ? "#042C53" : muted, border: `1px solid ${ev.rsvp === "interested" ? "#378ADD" : line}`, borderRadius: 999, padding: "10px 14px", cursor: "pointer", transition: "all 0.15s" }}>
                        {ev.rsvp === "interested" ? "Interested ✓" : "Interested"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: "18px 20px" }}>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: 14 }}>My upcoming</p>
            {myEvents.length === 0 ? (
              <p style={{ fontSize: 13, color: faint }}>You haven&apos;t RSVP&apos;d to LegacyValue events yet.</p>
            ) : myEvents.map((ev) => (
              <div key={ev.id} style={{ padding: "10px 0", borderBottom: `1px solid ${line}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: ink, marginBottom: 3 }}>{ev.title}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: faint }}>{ev.date} · {ev.rsvp === "going" ? "Going" : "Interested"}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: accent, marginTop: 2 }}>+{ev.xpReward} XP</div>
              </div>
            ))}
          </div>

          <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: "18px 20px" }}>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: 14 }}>Events earn rewards</p>
            {[["Attend a workshop", "+100 XP"], ["Complete a lab", "+150 XP"], ["Civic event", "+200 XP"], ["Bring a friend", "+50 coins"]].map(([act, reward]) => (
              <div key={act} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${line}` }}>
                <span style={{ fontSize: 12, color: muted }}>{act}</span>
                <span style={{ fontFamily: mono, fontSize: 11, color: accent, fontWeight: 700 }}>{reward}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

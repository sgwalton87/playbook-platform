"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProfileAvatar from "@/components/ProfileAvatar";

type Scholar = {
  id: string;
  username: string | null;
  avatar_url: string | null;
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
  incoming: boolean;
};

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
  const [suggested, setSuggested] = useState<Scholar[]>([]);
  const [connected, setConnected] = useState<Scholar[]>([]);
  const [tab, setTab] = useState<"suggested" | "connected" | "requests">("suggested");
  const [search, setSearch] = useState("");
  const [authed, setAuthed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<Scholar[]>([]);

  const loadNetwork = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    const me = authData.user;

    if (!me) {
      router.replace("/login");
      return;
    }

    setCurrentUserId(me.id);
    setAuthed(true);

    const { data: connectionRows, error: connectionError } = await supabase
      .from("user_connections")
      .select("connected_user_id")
      .eq("user_id", me.id);

    if (connectionError) {
      console.error("Connections load error:", connectionError.message);
    }

    const connectedIds = (connectionRows || []).map(
      (row: LegacyValue) => row.connected_user_id
    );

    const { data: sentRows } = await supabase
      .from("connection_requests")
      .select("recipient_id")
      .eq("requester_id", me.id)
      .eq("status", "pending");

    const sentIds = new Set(
      (sentRows || []).map((row: LegacyValue) => row.recipient_id)
    );

    const { data: incomingRows } = await supabase
      .from("connection_requests")
      .select("requester_id")
      .eq("recipient_id", me.id)
      .eq("status", "pending");

    const incomingIds = (incomingRows || []).map(
      (row: LegacyValue) => row.requester_id
    );

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        avatar_url,
        first_name,
        last_name,
        full_name,
        role,
        profile_mode,
        school,
        sport
      `)
      .neq("id", me.id)
      .order("created_at", { ascending: false })
      .limit(250);

    if (profileError) {
      console.error("Profile network load error:", profileError.message);
      return;
    }

    const toScholar = (profile: LegacyValue): Scholar => {
      const name =
        profile.full_name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        profile.username ||
        "Playbook Member";

      const initials = name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        id: profile.id,
        username: profile.username || null,
        avatar_url: profile.avatar_url || null,
        name,
        initials,
        color: "#F97316",
        role: profile.profile_mode || profile.role || "member",
        school: profile.school || "Playbook Network",
        sport: profile.sport || "—",
        level: 1,
        xp: 0,
        badges: [],
        pillars: [],
        connected: connectedIds.includes(profile.id),
        requested: sentIds.has(profile.id),
        incoming: incomingIds.includes(profile.id),
      };
    };

    const people = (profiles || []).map(toScholar);

    setConnected(
      people.filter((person) => connectedIds.includes(person.id))
    );

    setIncoming(
      people.filter((person) => incomingIds.includes(person.id))
    );

    setSuggested(
      people.filter(
        (person) =>
          !connectedIds.includes(person.id) &&
          !incomingIds.includes(person.id)
      )
    );

  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNetwork();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNetwork]);

  const sendRequest = async (id: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from("connection_requests")
      .upsert(
        {
          requester_id: currentUserId,
          recipient_id: id,
          status: "pending",
        },
        { onConflict: "requester_id,recipient_id" }
      );

    if (error) {
      console.error("Connection request error:", error.message);
      return;
    }

    await loadNetwork();
  };

  const cancelRequest = async (id: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from("connection_requests")
      .update({
        status: "cancelled",
        responded_at: new Date().toISOString(),
      })
      .eq("requester_id", currentUserId)
      .eq("recipient_id", id)
      .eq("status", "pending");

    if (error) {
      console.error("Cancel request error:", error.message);
      return;
    }

    await loadNetwork();
  };

  const acceptRequest = async (id: string) => {
    if (!currentUserId) return;

    const { error: requestError } = await supabase
      .from("connection_requests")
      .update({
        status: "accepted",
        responded_at: new Date().toISOString(),
      })
      .eq("requester_id", id)
      .eq("recipient_id", currentUserId)
      .eq("status", "pending");

    if (requestError) {
      console.error("Accept request error:", requestError.message);
      return;
    }

    const { error: firstConnectionError } = await supabase
      .from("user_connections")
      .upsert(
        {
          user_id: currentUserId,
          connected_user_id: id,
        },
        { onConflict: "user_id,connected_user_id" }
      );

    if (firstConnectionError) {
      console.error(
        "Connection creation error:",
        firstConnectionError.message
      );
      return;
    }

    const { error: secondConnectionError } = await supabase
      .from("user_connections")
      .upsert(
        {
          user_id: id,
          connected_user_id: currentUserId,
        },
        { onConflict: "user_id,connected_user_id" }
      );

    if (secondConnectionError) {
      console.error(
        "Reverse connection creation error:",
        secondConnectionError.message
      );
      return;
    }

    await loadNetwork();
  };

  const declineRequest = async (id: string) => {
    if (!currentUserId) return;

    await supabase
      .from("connection_requests")
      .update({
        status: "declined",
        responded_at: new Date().toISOString(),
      })
      .eq("requester_id", id)
      .eq("recipient_id", currentUserId)
      .eq("status", "pending");

    await loadNetwork();
  };

  const disconnect = async (id: string) => {
    if (!currentUserId) return;

    await supabase
      .from("user_connections")
      .delete()
      .eq("user_id", currentUserId)
      .eq("connected_user_id", id);

    await supabase
      .from("user_connections")
      .delete()
      .eq("user_id", id)
      .eq("connected_user_id", currentUserId);

    await loadNetwork();
  };


  const activeList =
    tab === "suggested" ? suggested :
    tab === "connected" ? connected :
    incoming;

  const filtered = activeList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.username || "").toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
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
            Search real Playbook users, send connection requests, accept support, and build your network.
          </p>
        </div>

        {/* Search + tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by name, username, role, school, or sport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, background: surface, border: `1px solid ${line}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: ink, fontFamily: "inherit", transition: "border-color 0.15s" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {(["suggested", "connected", "requests"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: tab === t ? accent : "transparent", color: tab === t ? onaccent : muted, border: `1px solid ${tab === t ? accent : line}`, borderRadius: 999, padding: "9px 18px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                {t === "suggested" ? `Suggested (${suggested.length})` :
                  t === "connected" ? `Connected (${connected.length})` :
                  `Requests (${incoming.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 16, padding: 40, textAlign: "center" }}>
            <p style={{ fontFamily: mono, fontSize: 12, color: faint, letterSpacing: "0.08em" }}>Search for users already in The Playbook, or switch tabs to review requests and connections.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
            {filtered.map((s) => (
              <div key={s.id} className="pb-card"
                style={{ background: surface, border: `1px solid ${s.connected ? accent + "44" : line}`, borderRadius: 18, padding: "20px 22px", transition: "border-color 0.15s" }}>

                {/* Avatar + name */}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                  <Link href={s.username ? `/u/${s.username}` : `/u/${s.id}`} style={{ flexShrink: 0 }}>
                    <ProfileAvatar src={s.avatar_url} name={s.name} size={52} />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={s.username ? `/u/${s.username}` : `/u/${s.id}`} style={{ fontSize: 15, fontWeight: 900, color: ink, marginBottom: 2, textDecoration: "none", display: "block" }}>
                      {s.name}
                    </Link>
                    <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: accent }}>{String(s.role).replaceAll("-", " ")}</div>
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
                  {s.incoming ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => acceptRequest(s.id)} style={{ flex: 1, fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: accent, color: onaccent, border: "none", borderRadius: 999, padding: "10px", cursor: "pointer" }}>
                        Accept
                      </button>
                      <button onClick={() => declineRequest(s.id)}
                        style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: "transparent", color: faint, border: `1px solid ${line}`, borderRadius: 999, padding: "10px 14px", cursor: "pointer" }}>
                        Decline
                      </button>
                    </div>
                  ) : s.connected ? (
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  username?: string | null;
  school?: string | null;
};

const bg = "#100c0a";
const surface = "#1a1512";
const ink = "#f6f0e7";
const muted = "#a89a8b";
const faint = "#6f6151";
const line = "#332a22";
const accent = "#ff6a2c";
const mono = "'Space Mono', monospace";
const anton = "'Anton', sans-serif";

function displayName(profile: Profile | null) {
  return profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.username || "Your profile";
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("first_name,last_name,full_name,username,school")
        .eq("id", userData.user.id)
        .maybeSingle();

      setProfile((data as Profile | null) || null);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) return <div style={{ minHeight: "100vh", background: bg, display: "grid", placeItems: "center", fontFamily: mono, fontSize: 12, color: faint }}>LOADING...</div>;

  return (
    <div style={{ minHeight: "100vh", background: bg, color: ink, fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Runtime leaderboard</p>
        <h1 style={{ fontFamily: anton, fontWeight: 400, fontSize: "clamp(32px,4vw,52px)", lineHeight: 0.95, textTransform: "uppercase", color: ink }}>Leaderboard</h1>

        <section style={{ background: surface, border: `1px solid ${line}`, borderRadius: 18, padding: 24, marginTop: 24 }}>
          <h2 style={{ marginTop: 0 }}>{displayName(profile)}</h2>
          <p style={{ color: muted, lineHeight: 1.6 }}>{profile?.school || "School not provided"}</p>
          <p style={{ color: faint, lineHeight: 1.6 }}>No live leaderboard, XP, coin, badge, or streak table is connected to this route yet. Placeholder rankings have been removed from production runtime.</p>
          <button onClick={() => router.push("/dashboard")} style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: accent, color: bg, border: "none", borderRadius: 999, padding: "10px 18px", cursor: "pointer" }}>Back to Dashboard</button>
        </section>
      </main>
    </div>
  );
}

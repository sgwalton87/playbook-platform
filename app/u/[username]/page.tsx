"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProfileAvatar from "@/components/ProfileAvatar";
import ThemeToggle from "@/components/ThemeToggle";
import { checkBadges } from "@/lib/badges";

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();

  const username = params?.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const loadTheme = () => {
      const saved = localStorage.getItem("playbook-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    };

    loadTheme();
    window.addEventListener("playbook-theme-change", loadTheme);

    return () =>
      window.removeEventListener("playbook-theme-change", loadTheme);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setProfile(data);
      setBadges(checkBadges(data));
      setLoading(false);
    };

    loadProfile();
  }, [username]);

  if (loading) return <div style={{ padding: 24 }}>Loading profile...</div>;

  if (!profile) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Profile not found</h1>
        <button onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </button>
      </main>
    );
  }

  const dark = theme === "dark";

  const bg = dark ? "#100c0a" : "#f6f0e7";
  const surface = dark ? "#1a1512" : "#ffffff";
  const ink = dark ? "#f6f0e7" : "#100c0a";
  const muted = dark ? "#a89a8b" : "#6b5f55";
  const line = dark ? "#332a22" : "#ddd2c7";
  const accent = "#ff6a2c";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: bg,
        color: ink,
        padding: 28,
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      }}
    >
      <ThemeToggle />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <header style={{ marginBottom: 32 }}>
        <p
          style={{
            color: accent,
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Playbook Public Profile
        </p>

        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 52,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Athlete Profile
        </h1>
      </header>

      <section
        style={{
          background: surface,
          border: `1px solid ${line}`,
          borderRadius: 28,
          padding: 30,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            flexWrap: "wrap",
          }}
        >
          <ProfileAvatar
            src={profile?.avatar_url}
            name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
            size={120}
          />

          <div>
            <h2 style={{ margin: 0, fontSize: 38 }}>
              {profile?.first_name} {profile?.last_name}
            </h2>

            <p style={{ color: muted, margin: "8px 0 0", fontSize: 16 }}>
              @{profile?.username || "username"}
            </p>

            <p style={{ color: muted, margin: "8px 0 0", fontSize: 16 }}>
              {profile?.school || "School not listed"} ·{" "}
              {profile?.sport || "Sport not listed"}
            </p>

            <p style={{ color: muted, margin: "8px 0 0", fontSize: 14 }}>
              {profile?.location || "Location not listed"}
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          ["Position", profile?.position || "-"],
          ["Height", profile?.height || "-"],
          ["Weight", profile?.weight || "-"],
          ["Jersey", profile?.jersey_number || "-"],
          ["Grad Year", profile?.grad_year || "-"],
          ["GPA", profile?.gpa || "-"],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              background: surface,
              border: `1px solid ${line}`,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <p style={{ color: muted, margin: 0 }}>{label}</p>
            <h3 style={{ margin: "8px 0 0", fontSize: 24 }}>{value}</h3>
          </div>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h3>About</h3>
          <p style={{ color: muted, lineHeight: 1.6 }}>
            {profile?.bio || "No bio added yet."}
          </p>
        </div>

        <div
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h3>Academics</h3>
          <p style={{ color: muted }}>SAT: {profile?.sat_score || "-"}</p>
          <p style={{ color: muted }}>ACT: {profile?.act_score || "-"}</p>
          <p style={{ color: muted }}>
            Intended Major: {profile?.intended_major || "-"}
          </p>
          <p style={{ color: muted }}>
            Dream School: {profile?.dream_school || "-"}
          </p>
        </div>

        <div
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h3>Team + Coach</h3>
          <p style={{ color: muted }}>
            Travel Team: {profile?.travel_team || "-"}
          </p>
          <p style={{ color: muted }}>
            Club Team: {profile?.club_team || "-"}
          </p>
          <p style={{ color: muted }}>
            Coach: {profile?.coach_name || "-"}
          </p>
          <p style={{ color: muted }}>
            Coach Email: {profile?.coach_email || "-"}
          </p>
        </div>
      </section>

      <section
        style={{
          background: surface,
          border: `1px solid ${line}`,
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h3>Badges</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {badges.length > 0 ? (
            badges.map((badge) => (
              <span
                key={badge}
                style={{
                  border: `1px solid ${line}`,
                  borderRadius: 999,
                  padding: "8px 12px",
                  background: dark ? "#100c0a" : "#f6f0e7",
                }}
              >
                🏅 {badge}
              </span>
            ))
          ) : (
            <p style={{ color: muted }}>No badges yet.</p>
          )}
        </div>
      </section>

      <section
        style={{
          background: surface,
          border: `1px solid ${line}`,
          borderRadius: 24,
          padding: 24,
        }}
      >
        <h3>Links</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {profile?.instagram && <a href={profile.instagram}>Instagram</a>}
          {profile?.tiktok && <a href={profile.tiktok}>TikTok</a>}
          {profile?.hudl && <a href={profile.hudl}>Hudl</a>}
          {profile?.youtube && <a href={profile.youtube}>YouTube</a>}
          {profile?.highlight_reel_url && (
            <a href={profile.highlight_reel_url}>Highlight Reel</a>
          )}
        </div>
      </section>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileAvatar from "@/components/ProfileAvatar";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<LegacyValue>(null);
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
    const load = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (!profileData) {
        router.replace("/onboarding");
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    load();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <div style={{ padding: 24 }}>Loading dashboard...</div>;

  const dark = theme === "dark";

  const bg = dark ? "#100c0a" : "#f6f0e7";
  const surface = dark ? "#1a1512" : "#ffffff";
  const ink = dark ? "#f6f0e7" : "#100c0a";
  const muted = dark ? "#a89a8b" : "#6b5f55";
  const line = dark ? "#332a22" : "#ddd2c7";
  const accent = "#ff6a2c";

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const coins = profile?.coin_balance ?? 0;

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
        button {
          border: 1px solid ${line};
          background: ${surface};
          color: ${ink};
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          font-weight: 800;
        }
        button:hover {
          border-color: ${accent};
          color: ${accent};
        }
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
          Playbook Series Inc.
        </p>

        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 52,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Dashboard
        </h1>
      </header>

      <section
        style={{
          background: surface,
          border: `1px solid ${line}`,
          borderRadius: 24,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <ProfileAvatar
            src={profile?.avatar_url}
            name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
            size={88}
          />

          <div>
            <h2 style={{ margin: 0, fontSize: 32 }}>
              Welcome, {profile?.first_name || "User"} 👋
            </h2>

            <p style={{ color: muted, margin: "8px 0 0" }}>
              {profile?.school || "School not added"} ·{" "}
              {profile?.sport || "Sport not added"}
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
          ["🧠", "Level", level],
          ["⚡", "XP", xp],
          ["💰", "Coins", coins],
          ["➡️", "Next Level", `${100 - (xp % 100)} XP`],
        ].map(([icon, label, value]) => (
          <div
            key={label}
            style={{
              background: surface,
              border: `1px solid ${line}`,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 28 }}>{icon}</div>
            <p style={{ color: muted, marginBottom: 6 }}>{label}</p>
            <h3 style={{ fontSize: 28, margin: 0 }}>{value}</h3>
          </div>
        ))}
      </section>

      <section
        style={{
          background: surface,
          border: `1px solid ${line}`,
          borderRadius: 24,
          padding: 24,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Quick Links</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button onClick={() => router.push("/profile")}>Profile</button>
          <button onClick={() => router.push("/courses")}>Courses</button>
          <button onClick={() => router.push("/badges")}>Badges</button>
          <button onClick={() => router.push("/store")}>Store</button>
          <button onClick={logout}>Logout</button>
          <button onClick={() => router.push(`/u/${profile?.username}`)}>
  View Public Profile
</button>
        </div>
      </section>
    </main>
  );
}
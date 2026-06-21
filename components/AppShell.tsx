"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProfileAvatar from "@/components/ProfileAvatar";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Profile", href: "/profile", icon: "👤" },
  { label: "Feed", href: "/feed", icon: "💬" },
  { label: "Courses", href: "/courses", icon: "📚" },
  { label: "Transcript", href: "/transcript", icon: "🎓" },
  { label: "Certificates", href: "/certificates", icon: "🏅" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Connections", href: "/connections", icon: "🤝" },
  { label: "Mentorship", href: "/mentorship", icon: "🧭" },
  { label: "Events", href: "/events", icon: "📅" },
  { label: "Leaderboard", href: "/leaderboard", icon: "🏆" },
  { label: "Store", href: "/store", icon: "🛒" },
];

export default function AppShell({
  children,
  title = "Playbook",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bg = "#f6f0e7";
  const sidebar = "#0f172a";
  const sidebarSoft = "#111827";
  const sidebarLine = "rgba(255,255,255,.12)";
  const ink = "#100c0a";
  const cream = "#f8f7f4";
  const muted = "rgba(248,247,244,.58)";
  const accent = "#ff6a2c";

  useEffect(() => {
    const loadProfile = async () => {
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

    loadProfile();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const goPublicProfile = () => {
    if (profile?.username) router.push(`/u/${profile.username}`);
    else router.push("/profile");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: bg, color: ink, padding: 24 }}>
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: ink,
        display: "grid",
        gridTemplateColumns: "285px 1fr",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        a { color: inherit; text-decoration: none; }
      `}</style>

      <aside
        style={{
          borderRight: `1px solid ${sidebarLine}`,
          background: sidebar,
          color: cream,
          padding: 22,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: "100%",
            marginBottom: 18,
            padding: "11px 14px",
            borderRadius: 999,
            border: `1px solid ${sidebarLine}`,
            background: sidebarSoft,
            color: cream,
            cursor: "pointer",
            fontWeight: 900,
            textAlign: "left",
          }}
        >
          ← Back
        </button>

        <div
          onClick={() => router.push("/dashboard")}
          style={{
            cursor: "pointer",
            marginBottom: 28,
            background: sidebarSoft,
            border: `1px solid ${sidebarLine}`,
            borderRadius: 22,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/assets/pb-logo-framed.png"
              alt="Playbook Series Inc."
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                objectFit: "cover",
                border: `2px solid ${accent}`,
              }}
            />

            <div>
              <p
                style={{
                  color: accent,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  margin: "0 0 6px",
                }}
              >
                Playbook Series
              </p>

              <h1
                style={{
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 34,
                  lineHeight: 0.9,
                  margin: 0,
                  textTransform: "uppercase",
                  color: cream,
                }}
              >
                Playbook
              </h1>
            </div>
          </div>
        </div>

        <div
          onClick={goPublicProfile}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: `1px solid ${sidebarLine}`,
            borderRadius: 18,
            padding: 12,
            marginBottom: 24,
            background: sidebarSoft,
            cursor: "pointer",
          }}
        >
          <ProfileAvatar
            src={profile?.avatar_url}
            name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
            size={46}
          />

          <div>
            <strong style={{ color: cream }}>{profile?.first_name || "User"}</strong>
            <p style={{ margin: "4px 0 0", color: muted, fontSize: 12 }}>
              View public profile
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: `1px solid ${active ? accent : "transparent"}`,
                  background: active ? accent : "transparent",
                  color: active ? "#100c0a" : cream,
                  cursor: "pointer",
                  fontWeight: 800,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={logout}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "12px 14px",
            borderRadius: 14,
            border: `1px solid ${sidebarLine}`,
            background: "transparent",
            color: muted,
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ padding: 32, maxWidth: "100%", overflowX: "hidden" }}>
        <header style={{ marginBottom: 28 }}>
          <p
            style={{
              color: accent,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              margin: "0 0 8px",
            }}
          >
            Internal Dashboard
          </p>

          <h2
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 48,
              margin: 0,
              textTransform: "uppercase",
              color: ink,
            }}
          >
            {title}
          </h2>
        </header>

        {children}
      </main>
    </div>
  );
}

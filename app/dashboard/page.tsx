"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AppShell from "@/components/AppShell";
import ProfileAvatar from "@/components/ProfileAvatar";

const surface = "#ffffff";
const soft = "#fbf7f1";
const ink = "#100c0a";
const muted = "#6b5f55";
const line = "#ddd2c7";
const accent = "#ff6a2c";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const userId = user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data: certificateData } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });

      const { data: progressData } = await supabase
        .from("course_progress")
        .select(`
          *,
          courses (
            title
          )
        `)
        .eq("user_id", userId)
        .eq("completed", true)
        .order("completed_at", { ascending: false });

      const { data: badgeData } = await supabase
        .from("user_badges")
        .select(`
          id,
          awarded_at,
          badges (
            id,
            name,
            description,
            image_url
          )
        `)
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false });

      const { data: feedData } = await supabase
        .from("feed_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      setProfile(profileData);
      setCertificates(certificateData || []);
      setCompletedCourses(progressData || []);
      setBadges(badgeData || []);
      setFeedPosts(feedData || []);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <p>Loading dashboard...</p>
      </AppShell>
    );
  }

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const coins = profile?.coin_balance ?? 0;
  const nextLevel = 100 - (xp % 100);
  const progress = xp % 100;

  return (
    <AppShell title="Dashboard">
      <div style={{ display: "grid", gap: 24 }}>
        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 28,
            display: "flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <ProfileAvatar
            src={profile?.avatar_url}
            name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
            size={96}
          />

          <div>
            <h2 style={{ margin: 0, fontSize: 34, color: ink }}>
              Welcome, {profile?.first_name || "User"} 👋
            </h2>

            <p style={{ marginTop: 8, color: muted }}>
              {profile?.school || "School not added"} ·{" "}
              {profile?.sport || "Sport not added"}
            </p>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {[
            ["🧠", "Level", level],
            ["⚡", "XP", xp],
            ["💰", "Coins", coins],
            ["🎓", "Certificates", certificates.length],
            ["🏅", "Badges", badges.length],
            ["➡️", "Next Level", `${nextLevel} XP`],
          ].map(([icon, label, value]) => (
            <div
              key={label}
              style={{
                background: surface,
                border: `1px solid ${line}`,
                borderRadius: 20,
                padding: 20,
                color: ink,
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
            color: ink,
          }}
        >
          <h3 style={{ marginTop: 0 }}>XP Progress</h3>

          <div
            style={{
              height: 12,
              background: soft,
              borderRadius: 999,
              overflow: "hidden",
              border: `1px solid ${line}`,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: accent,
              }}
            />
          </div>

          <p style={{ color: muted }}>{progress}/100 XP toward next level</p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {[
            ["📚 Continue Courses", "/courses"],
            ["🎓 My Transcript", "/transcript"],
            ["💬 Community Feed", "/feed"],
            ["🤝 Connections", "/connections"],
            ["🏆 Leaderboard", "/leaderboard"],
          ].map(([label, path]) => (
            <a
              key={label}
              href={path}
              style={{
                background: surface,
                border: `1px solid ${line}`,
                borderRadius: 20,
                padding: 22,
                color: ink,
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              {label}
            </a>
          ))}
        </section>

        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
            color: ink,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Certificates</h3>

          {certificates.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    background: soft,
                    border: `1px solid ${line}`,
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <strong>🎓 {cert.certificate_name}</strong>
                  <p style={{ color: muted, marginBottom: 0 }}>
                    Issued{" "}
                    {cert.issued_at
                      ? new Date(cert.issued_at).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: muted }}>No certificates earned yet.</p>
          )}
        </section>

        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
            color: ink,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Badges</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {badges.length > 0 ? (
              badges.map((item) => (
                <span
                  key={item.id}
                  style={{
                    border: `1px solid ${line}`,
                    borderRadius: 999,
                    padding: "8px 12px",
                    background: soft,
                    color: ink,
                    fontWeight: 900,
                  }}
                >
                  🏅 {item.badges?.name}
                </span>
              ))
            ) : (
              <p style={{ color: muted }}>No badges earned yet.</p>
            )}
          </div>
        </section>

        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
            color: ink,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Completed Courses</h3>

          {completedCourses.length > 0 ? (
            completedCourses.slice(0, 5).map((item) => (
              <div
                key={item.id}
                style={{
                  borderBottom: `1px solid ${line}`,
                  padding: "12px 0",
                }}
              >
                <strong>{item.courses?.title || item.course_slug}</strong>
                <p style={{ color: muted, marginBottom: 0 }}>
                  Completed{" "}
                  {item.completed_at
                    ? new Date(item.completed_at).toLocaleDateString()
                    : ""}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: muted }}>No completed courses yet.</p>
          )}
        </section>

        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
            color: ink,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Recent Activity</h3>

          {feedPosts.length > 0 ? (
            feedPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  borderBottom: `1px solid ${line}`,
                  padding: "12px 0",
                }}
              >
                <strong>{post.title}</strong>
                <p style={{ color: muted, marginBottom: 0 }}>{post.body}</p>
              </div>
            ))
          ) : (
            <>
              <p style={{ color: muted }}>🎉 Profile created</p>
              <p style={{ color: muted }}>⚡ XP started</p>
              <p style={{ color: muted }}>
                🏀 Scholar-athlete profile activated
              </p>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
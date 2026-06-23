"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const surface = "#ffffff";
const soft = "#fbf7f1";
const ink = "#100c0a";
const muted = "#6b5f55";
const line = "#ddd2c7";
const accent = "#ff6a2c";

export default function TranscriptPage() {
  const [profile, setProfile] = useState<any>(null);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranscript = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setLoading(false);
        return;
      }

      const userId = userData.user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data: progressData } = await supabase
        .from("course_progress")
        .select(`
          *,
          courses (
            title,
            pillar
          )
        `)
        .eq("user_id", userId)
        .eq("completed", true)
        .order("completed_at", { ascending: false });

      const { data: certificateData } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });

      const { data: badgeData } = await supabase
        .from("user_badges")
        .select(`
          id,
          awarded_at,
          badges (
            name,
            description
          )
        `)
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false });

      setProfile(profileData);
      setCompletedCourses(progressData || []);
      setCertificates(certificateData || []);
      setBadges(badgeData || []);
      setLoading(false);
    };

    loadTranscript();
  }, []);

  if (loading) {
    return (
      <AppShell title="Transcript">
        <p>Loading transcript...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Transcript">
      <div style={{ display: "grid", gap: 24 }}>
        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 28,
            padding: 28,
          }}
        >
          <p
            style={{
              color: accent,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              fontWeight: 900,
              fontSize: 12,
              marginTop: 0,
            }}
          >
            Official Playbook Record
          </p>

          <h1 style={{ margin: 0, color: ink, fontSize: 42 }}>
            {profile?.first_name} {profile?.last_name}
          </h1>

          <p style={{ color: muted, marginTop: 8 }}>
            Courses completed, certificates earned, badges unlocked, XP, and coins.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 14,
              marginTop: 22,
            }}
          >
            {[
              ["⚡ XP", profile?.xp ?? 0],
              ["💰 Coins", profile?.coin_balance ?? 0],
              ["📚 Completed", completedCourses.length],
              ["🎓 Certificates", certificates.length],
              ["🏅 Badges", badges.length],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: soft,
                  border: `1px solid ${line}`,
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <p style={{ color: muted, margin: 0 }}>{label}</p>
                <h2 style={{ margin: "8px 0 0", color: ink }}>{value}</h2>
              </div>
            ))}
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
          <h2 style={{ marginTop: 0 }}>Completed Courses</h2>

          {completedCourses.length > 0 ? (
            completedCourses.map((item) => (
              <div
                key={item.id}
                style={{
                  borderBottom: `1px solid ${line}`,
                  padding: "14px 0",
                }}
              >
                <strong>{item.courses?.title || item.course_slug}</strong>
                <p style={{ color: muted, marginBottom: 0 }}>
                  {item.courses?.pillar || "Course"} · Completed{" "}
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
          }}
        >
          <h2 style={{ marginTop: 0 }}>Certificates</h2>

          {certificates.length > 0 ? (
            certificates.map((cert) => (
              <div
                key={cert.id}
                style={{
                  background: soft,
                  border: `1px solid ${line}`,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <strong>🎓 {cert.certificate_name}</strong>
                <p style={{ color: muted, marginBottom: 0 }}>
                  Earned{" "}
                  {cert.issued_at
                    ? new Date(cert.issued_at).toLocaleDateString()
                    : ""}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: muted }}>No certificates yet.</p>
          )}
        </section>

        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Badges</h2>

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
      </div>
    </AppShell>
  );
}

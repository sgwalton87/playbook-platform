"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProfileAvatar from "@/components/ProfileAvatar";
import { checkBadges } from "@/lib/badges";

const surface = "#ffffff";
const soft = "#fbf7f1";
const ink = "#100c0a";
const muted = "#6b5f55";
const line = "#ddd2c7";

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error || !profileData) {
        setLoading(false);
        return;
      }

      const { data: certificateData } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", profileData.id)
        .order("issued_at", { ascending: false });

      const { data: badgeData } = await supabase
        .from("user_badges")
        .select(`id, awarded_at, badges (id, name, description, image_url)`)
        .eq("user_id", profileData.id)
        .order("awarded_at", { ascending: false });

      const profileBadges = checkBadges(profileData);

      const combinedBadges = [
        ...profileBadges.map((name: string) => ({
          id: `profile-${name}`,
          displayName: name,
        })),
        ...(badgeData || []).map((item: any) => ({
          id: item.id,
          displayName: item.badges?.name,
        })),
      ].filter((badge) => badge.displayName);

      setProfile(profileData);
      setCertificates(certificateData || []);
      setBadges(combinedBadges);
      setLoading(false);
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <AppShell title="Public Profile">
        <p>Loading profile...</p>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell title="Public Profile">
        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 28,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Profile not found</h2>
          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="Public Profile">
      <div style={{ display: "grid", gap: 24 }}>
        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 28,
            padding: 30,
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
              <h2 style={{ margin: 0, fontSize: 38, color: ink }}>
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
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
          }}
        >
          {[
            ["⚡ XP", profile?.xp ?? 0],
            ["💰 Coins", profile?.coin_balance ?? 0],
            ["🎓 Certificates", certificates.length],
            ["🏅 Badges", badges.length],
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
              <h3 style={{ margin: "8px 0 0", fontSize: 26, color: ink }}>
                {value}
              </h3>
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
          <h3 style={{ color: ink, marginTop: 0 }}>Certificates</h3>

          {certificates.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 16,
              }}
            >
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    background: soft,
                    border: `1px solid ${line}`,
                    borderRadius: 20,
                    padding: 20,
                  }}
                >
                  <div style={{ fontSize: 42 }}>🎓</div>

                  <h4 style={{ marginBottom: 6, color: ink }}>
                    {cert.certificate_name}
                  </h4>

                  <p style={{ color: muted, marginBottom: 0 }}>
                    Earned{" "}
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
          }}
        >
          <h3 style={{ color: ink, marginTop: 0 }}>Badges</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {badges.length > 0 ? (
              badges.map((badge) => (
                <span
                  key={badge.id}
                  style={{
                    border: `1px solid ${line}`,
                    borderRadius: 999,
                    padding: "8px 12px",
                    background: soft,
                    color: ink,
                    fontWeight: 900,
                  }}
                >
                  🏅 {badge.displayName}
                </span>
              ))
            ) : (
              <p style={{ color: muted }}>No badges yet.</p>
            )}
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
              <h3 style={{ margin: "8px 0 0", fontSize: 24, color: ink }}>
                {value}
              </h3>
            </div>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
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
            <h3 style={{ color: ink }}>About</h3>
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
            <h3 style={{ color: ink }}>Academics</h3>
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
            <h3 style={{ color: ink }}>Team + Coach</h3>
            <p style={{ color: muted }}>
              Travel Team: {profile?.travel_team || "-"}
            </p>
            <p style={{ color: muted }}>
              Club Team: {profile?.club_team || "-"}
            </p>
            <p style={{ color: muted }}>Coach: {profile?.coach_name || "-"}</p>
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
          }}
        >
          <h3 style={{ color: ink }}>Links</h3>

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
      </div>
    </AppShell>
  );
}

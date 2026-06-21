"use client";

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
const accent = "#ff6a2c";

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;

  const [viewerId, setViewerId] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) setViewerId(userData.user.id);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", username)
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

      const { data: feedData } = await supabase
        .from("feed_posts")
        .select("*")
        .eq("user_id", profileData.id)
        .or("visibility.eq.public,visibility.is.null")
        .order("created_at", { ascending: false })
        .limit(25);

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
      setPosts(feedData || []);
      setLoading(false);
    };

    loadProfile();
  }, [username]);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`public-profile-feed-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "feed_posts",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          setPosts((current) => {
            if (current.some((post) => post.id === payload.new.id)) {
              return current;
            }

            return [payload.new, ...current];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const createPost = async () => {
    if (!newPost.trim() || !viewerId || !profile?.id) return;

    if (viewerId !== profile.id) {
      alert("You can only post from your own public profile.");
      return;
    }

    setPosting(true);

    const { data, error } = await supabase
      .from("feed_posts")
      .insert({
        user_id: viewerId,
        post_type: "text",
        title: "Community Post",
        body: newPost.trim(),
        visibility: "public",
      })
      .select("*")
      .single();

    if (error) {
      alert(error.message);
      setPosting(false);
      return;
    }

    if (data) {
      setPosts((current) => {
        if (current.some((post) => post.id === data.id)) return current;
        return [data, ...current];
      });
    }

    setNewPost("");
    setPosting(false);
  };

  if (loading) return <p>Loading profile...</p>;

  if (!profile) {
    return (
      <section style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 28 }}>
        <h2 style={{ marginTop: 0 }}>Profile not found</h2>
        <button onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </section>
    );
  }

  const isOwnProfile = viewerId === profile.id;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ background: surface, border: `1px solid ${line}`, borderRadius: 28, padding: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <ProfileAvatar
            src={profile?.avatar_url}
            name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
            size={120}
          />

          <div>
            <h2 style={{ margin: 0, fontSize: 38, color: ink }}>
              {profile?.first_name} {profile?.last_name}
            </h2>

            <p style={{ color: muted, margin: "8px 0 0" }}>@{profile?.username}</p>

            <p style={{ color: muted, margin: "8px 0 0" }}>
              {profile?.school || "School not listed"} · {profile?.sport || "Sport not listed"}
            </p>

            <p style={{ color: muted, margin: "8px 0 0" }}>
              {profile?.location || "Location not listed"}
            </p>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
        {[
          ["⚡ XP", profile?.xp ?? 0],
          ["💰 Coins", profile?.coin_balance ?? 0],
          ["🎓 Certificates", certificates.length],
          ["🏅 Badges", badges.length],
          ["💬 Posts", posts.length],
        ].map(([label, value]) => (
          <div key={label} style={{ background: surface, border: `1px solid ${line}`, borderRadius: 20, padding: 20 }}>
            <p style={{ color: muted, margin: 0 }}>{label}</p>
            <h3 style={{ margin: "8px 0 0", fontSize: 26, color: ink }}>{value}</h3>
          </div>
        ))}
      </section>

      <section style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 24 }}>
        <h3 style={{ color: ink, marginTop: 0 }}>Community Feed</h3>

        {isOwnProfile && (
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22 }}>
            <ProfileAvatar
              src={profile?.avatar_url}
              name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
              size={48}
            />

            <div style={{ flex: 1 }}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Post something to your public community feed..."
                rows={4}
                style={{
                  width: "100%",
                  background: soft,
                  border: `1px solid ${line}`,
                  borderRadius: 14,
                  padding: 14,
                  color: ink,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />

              <button
                onClick={createPost}
                disabled={posting || !newPost.trim()}
                style={{
                  marginTop: 12,
                  background: newPost.trim() ? accent : line,
                  color: ink,
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 18px",
                  fontWeight: 900,
                  cursor: newPost.trim() ? "pointer" : "default",
                }}
              >
                {posting ? "Posting..." : "Post to Public Feed"}
              </button>
            </div>
          </div>
        )}

        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} style={{ borderTop: `1px solid ${line}`, padding: "16px 0" }}>
              {post.title && <strong>{post.title}</strong>}

              <p style={{ color: ink, lineHeight: 1.6 }}>{post.body}</p>

              <p style={{ color: muted, fontSize: 13, marginBottom: 0 }}>
                {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
              </p>
            </article>
          ))
        ) : (
          <p style={{ color: muted }}>No public community posts yet.</p>
        )}
      </section>

      <section style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 24 }}>
        <h3 style={{ color: ink, marginTop: 0 }}>Certificates</h3>

        {certificates.length > 0 ? certificates.map((cert) => (
          <div key={cert.id} style={{ background: soft, border: `1px solid ${line}`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
            <strong>🎓 {cert.certificate_name}</strong>
            <p style={{ color: muted, marginBottom: 0 }}>
              Earned {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : ""}
            </p>
          </div>
        )) : <p style={{ color: muted }}>No certificates yet.</p>}
      </section>

      <section style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 24 }}>
        <h3 style={{ color: ink, marginTop: 0 }}>Badges</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {badges.length > 0 ? badges.map((badge) => (
            <span key={badge.id} style={{ border: `1px solid ${line}`, borderRadius: 999, padding: "8px 12px", background: soft, color: ink, fontWeight: 900 }}>
              🏅 {badge.displayName}
            </span>
          )) : <p style={{ color: muted }}>No badges yet.</p>}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 24 }}>
          <h3 style={{ color: ink }}>About</h3>
          <p style={{ color: muted, lineHeight: 1.6 }}>{profile?.bio || "No bio added yet."}</p>
        </div>

        <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 24 }}>
          <h3 style={{ color: ink }}>Academics</h3>
          <p style={{ color: muted }}>GPA: {profile?.gpa || "-"}</p>
          <p style={{ color: muted }}>SAT: {profile?.sat_score || "-"}</p>
          <p style={{ color: muted }}>ACT: {profile?.act_score || "-"}</p>
          <p style={{ color: muted }}>Dream School: {profile?.dream_school || "-"}</p>
        </div>

        <div style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 24 }}>
          <h3 style={{ color: ink }}>Team + Coach</h3>
          <p style={{ color: muted }}>Travel Team: {profile?.travel_team || "-"}</p>
          <p style={{ color: muted }}>Club Team: {profile?.club_team || "-"}</p>
          <p style={{ color: muted }}>Coach: {profile?.coach_name || "-"}</p>
          <p style={{ color: muted }}>Coach Email: {profile?.coach_email || "-"}</p>
        </div>
      </section>
    </div>
  );
}

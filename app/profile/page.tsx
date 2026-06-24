"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileAvatar from "@/components/ProfileAvatar";
import { checkBadges } from "@/lib/badges";
import CollegeSearch from "@/components/CollegeSearch";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [school, setSchool] = useState("");
  const [sport, setSport] = useState("");

  const [position, setPosition] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [dominantHand, setDominantHand] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [travelTeam, setTravelTeam] = useState("");
  const [clubTeam, setClubTeam] = useState("");
  const [coachName, setCoachName] = useState("");
  const [coachEmail, setCoachEmail] = useState("");

  const [satScore, setSatScore] = useState("");
  const [actScore, setActScore] = useState("");
  const [intendedMajor, setIntendedMajor] = useState("");
  const [dreamSchool, setDreamSchool] = useState("");
  const [dreamSchoolId, setDreamSchoolId] = useState("");

  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [hudl, setHudl] = useState("");
  const [youtube, setYoutube] = useState("");
  const [highlightReelUrl, setHighlightReelUrl] = useState("");

  useEffect(() => {
    const loadTheme = () => {
      const saved = localStorage.getItem("playbook-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    };

    loadTheme();
    window.addEventListener("playbook-theme-change", loadTheme);

    return () => window.removeEventListener("playbook-theme-change", loadTheme);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (error || !profileData) {
        router.replace("/onboarding");
        return;
      }

      setProfile(profileData);

      setAvatarUrl(profileData.avatar_url || "");
      setBio(profileData.bio || "");
      setLocation(profileData.location || "");
      setSchool(profileData.school || "");
      setSport(profileData.sport || "");

      setPosition(profileData.position || "");
      setHeight(profileData.height || "");
      setWeight(profileData.weight || "");
      setDominantHand(profileData.dominant_hand || "");
      setJerseyNumber(profileData.jersey_number || "");
      setTravelTeam(profileData.travel_team || "");
      setClubTeam(profileData.club_team || "");
      setCoachName(profileData.coach_name || "");
      setCoachEmail(profileData.coach_email || "");

      setSatScore(profileData.sat_score || "");
      setActScore(profileData.act_score || "");
      setIntendedMajor(profileData.intended_major || "");
      setDreamSchoolId(profileData.dream_school_id || "");

      setInstagram(profileData.instagram || "");
      setTiktok(profileData.tiktok || "");
      setHudl(profileData.hudl || "");
      setYoutube(profileData.youtube || "");
      setHighlightReelUrl(profileData.highlight_reel_url || "");

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const uploadAvatar = async (file: File) => {
    setUploading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setUploading(false);
      router.replace("/login");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setUploading(false);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    setAvatarUrl(publicUrl);
    setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
  };

  const saveProfile = async () => {
    setSaving(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    const updatedProfile = {
      ...profile,
      avatar_url: avatarUrl,
      bio,
      location,
      school,
      sport,
      position,
      height,
      weight,
      dominant_hand: dominantHand,
      jersey_number: jerseyNumber,
      travel_team: travelTeam,
      club_team: clubTeam,
      coach_name: coachName,
      coach_email: coachEmail,
      sat_score: satScore,
      act_score: actScore,
      intended_major: intendedMajor,
      dream_school: dreamSchool,
      dream_school_name: dreamSchool,
      dream_school_id: dreamSchoolId || null,
      instagram,
      tiktok,
      hudl,
      youtube,
      highlight_reel_url: highlightReelUrl,
    };

    const badges = checkBadges(updatedProfile);

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        bio,
        location,
        school,
        sport,
        position,
        height,
        weight,
        dominant_hand: dominantHand,
        jersey_number: jerseyNumber,
        travel_team: travelTeam,
        club_team: clubTeam,
        coach_name: coachName,
        coach_email: coachEmail,
        sat_score: satScore,
        act_score: actScore,
        intended_major: intendedMajor,
        dream_school: dreamSchool,
        dream_school_name: dreamSchool,
        dream_school_id: dreamSchoolId || null,
        instagram,
        tiktok,
        hudl,
        youtube,
        highlight_reel_url: highlightReelUrl,
        badges,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setProfile({ ...updatedProfile, badges });
    alert("Profile saved!");
  };

  if (loading) return <div style={{ padding: 24 }}>Loading profile...</div>;

  const dark = theme === "dark";
  const bg = dark ? "#100c0a" : "#f6f0e7";
  const surface = dark ? "#1a1512" : "#ffffff";
  const ink = dark ? "#f6f0e7" : "#100c0a";
  const muted = dark ? "#a89a8b" : "#6b5f55";
  const line = dark ? "#332a22" : "#ddd2c7";
  const accent = "#ff6a2c";

  const inputGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  };

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

        input, textarea {
          width: 100%;
          background: ${dark ? "#100c0a" : "#f6f0e7"};
          color: ${ink};
          border: 1px solid ${line};
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 14px;
          font-family: inherit;
        }

        textarea {
          min-height: 120px;
          resize: vertical;
        }

        label {
          display: block;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${muted};
          margin-bottom: 6px;
        }

        button {
          border: 1px solid ${line};
          background: ${accent};
          color: #100c0a;
          border-radius: 12px;
          padding: 14px 18px;
          cursor: pointer;
          font-weight: 900;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          Scholar-Athlete Profile
        </p>

        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 52,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Profile
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
            src={avatarUrl}
            name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
            size={96}
          />

          <div>
            <h2 style={{ margin: 0, fontSize: 32 }}>
              {profile?.first_name} {profile?.last_name}
            </h2>

            <p style={{ color: muted, margin: "8px 0 0" }}>
              {school || "School not added"} · {sport || "Sport not added"}
            </p>

            <p style={{ color: muted, margin: "6px 0 0", fontSize: 13 }}>
              XP: {profile?.xp ?? 0} · Level: {profile?.level ?? 1} · Coins:{" "}
              {profile?.coin_balance ?? 0}
            </p>
          </div>
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
        <h3>Profile Picture</h3>
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadAvatar(file);
          }}
        />

        {uploading && <p style={{ color: muted }}>Uploading photo...</p>}

        <label>Bio</label>
        <textarea
          placeholder="Tell the Playbook community about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div style={inputGrid}>
          <div>
            <label>City</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div>
            <label>School</label>
            <input value={school} onChange={(e) => setSchool(e.target.value)} />
          </div>

          <div>
            <label>Sport</label>
            <input value={sport} onChange={(e) => setSport(e.target.value)} />
          </div>
        </div>
      </section>

      <section style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 24, marginBottom: 24 }}>
        <h3>Athlete Profile</h3>

        <div style={inputGrid}>
          <div><label>Position</label><input value={position} onChange={(e) => setPosition(e.target.value)} /></div>
          <div><label>Height</label><input value={height} onChange={(e) => setHeight(e.target.value)} /></div>
          <div><label>Weight</label><input value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
          <div><label>Dominant Hand</label><input value={dominantHand} onChange={(e) => setDominantHand(e.target.value)} /></div>
          <div><label>Jersey Number</label><input value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} /></div>
          <div><label>Travel Team</label><input value={travelTeam} onChange={(e) => setTravelTeam(e.target.value)} /></div>
          <div><label>Club Team</label><input value={clubTeam} onChange={(e) => setClubTeam(e.target.value)} /></div>
          <div><label>Coach Name</label><input value={coachName} onChange={(e) => setCoachName(e.target.value)} /></div>
          <div><label>Coach Email</label><input value={coachEmail} onChange={(e) => setCoachEmail(e.target.value)} /></div>
        </div>
      </section>

      <section style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 24, marginBottom: 24 }}>
        <h3>Academic Profile</h3>

        <div style={inputGrid}>
          <div><label>SAT Score</label><input value={satScore} onChange={(e) => setSatScore(e.target.value)} /></div>
          <div><label>ACT Score</label><input value={actScore} onChange={(e) => setActScore(e.target.value)} /></div>
          <div><label>Intended Major</label><input value={intendedMajor} onChange={(e) => setIntendedMajor(e.target.value)} /></div>
          <div>
  <label>Dream School</label>

  <CollegeSearch
    value={dreamSchool}
    onChange={(schoolName, schoolId) => {
      setDreamSchool(schoolName);
      setDreamSchoolId(schoolId || "");
    }}
  />
</div>
        </div>
      </section>

      <section style={{ background: surface, border: `1px solid ${line}`, borderRadius: 24, padding: 24 }}>
        <h3>Social + Recruiting Links</h3>

        <div style={inputGrid}>
          <div><label>Instagram</label><input value={instagram} onChange={(e) => setInstagram(e.target.value)} /></div>
          <div><label>TikTok</label><input value={tiktok} onChange={(e) => setTiktok(e.target.value)} /></div>
          <div><label>Hudl</label><input value={hudl} onChange={(e) => setHudl(e.target.value)} /></div>
          <div><label>YouTube</label><input value={youtube} onChange={(e) => setYoutube(e.target.value)} /></div>
          <div><label>Highlight Reel URL</label><input value={highlightReelUrl} onChange={(e) => setHighlightReelUrl(e.target.value)} /></div>
        </div>

        <button onClick={saveProfile} disabled={saving || uploading}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </section>
    </main>
  );
}
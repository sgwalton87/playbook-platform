"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlaybookButton,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui/PlaybookPage";
import { supabase } from "@/lib/supabaseClient";

type ShareStatus = "draft" | "active" | "expired" | "revoked";

type ShareRow = {
  share_id: string;
  target_use: string;
  packet: Record<string, boolean>;
  status: ShareStatus;
  expires_at: string | null;
  created_at: string;
  expiredByTime: boolean;
  viewable: boolean;
};

type SourceSnapshot = {
  displayName: string;
  bio: boolean;
  profileMedia: number;
  socialProfiles: number;
  brandInterests: number;
  sport: string | null;
  position: string | null;
  graduationYear: number | null;
  highlightFilm: boolean;
};

const defaultPacket: Record<string, boolean> = {
  include_bio: true,
  include_profile_media: true,
  include_social_links: true,
  include_brand_interests: true,
  include_athlete_profile: true,
  include_highlight_film: true,
  include_media_summary: true,
};

const sections = [
  ["include_bio", "Bio", "Current profile bio"],
  ["include_profile_media", "Profile media", "Current profile photo and cover links"],
  ["include_social_links", "Social links", "Only social profiles already saved to Playbook"],
  ["include_brand_interests", "Brand interests", "NIL partnership interests already in your profile"],
  ["include_athlete_profile", "Athlete basics", "Sport, position, secondary position, graduation year"],
  ["include_highlight_film", "Highlight film", "Current Athlete Profile highlight link"],
  ["include_media_summary", "Media library summary", "Count of profile media items; private media files stay private"],
] as const;

export default function NILMediaKitPage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState("");
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [source, setSource] = useState<SourceSnapshot | null>(null);
  const [packet, setPacket] = useState<Record<string, boolean>>(defaultPacket);
  const [expiry, setExpiry] = useState("30");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadWorkspace(userId: string) {
    const [sharesResult, profileResult, athleteResult, mediaResult] = await Promise.all([
      supabase
        .from("portfolio_shares")
        .select("share_id,target_use,packet,status,expires_at,created_at")
        .eq("scholar_id", userId)
        .eq("target_use", "nil")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("full_name,username,bio,avatar_url,cover_url,instagram,tiktok,twitter,nil_instagram,nil_tiktok,nil_twitter,nil_brand_interests")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("athlete_profiles")
        .select("sport,position,graduation_year,highlight_url")
        .eq("scholar_id", userId)
        .maybeSingle(),
      supabase
        .from("album_media")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    const firstError = sharesResult.error || profileResult.error || athleteResult.error || mediaResult.error;
    if (firstError) throw firstError;

    const profile = profileResult.data;
    const athlete = athleteResult.data;
    const socials = [profile?.nil_instagram || profile?.instagram, profile?.nil_tiktok || profile?.tiktok, profile?.nil_twitter || profile?.twitter].filter(Boolean);
    const now = Date.now();
    const classifiedShares = ((sharesResult.data || []) as Array<Omit<ShareRow, "expiredByTime" | "viewable">>).map((share) => {
      const expiredByTime = Boolean(share.expires_at && new Date(share.expires_at).getTime() <= now);
      return { ...share, expiredByTime, viewable: share.status === "active" && !expiredByTime };
    });

    setShares(classifiedShares);
    setSource({
      displayName: profile?.full_name?.trim() || profile?.username?.trim() || "Scholar",
      bio: Boolean(profile?.bio?.trim()),
      profileMedia: [profile?.avatar_url, profile?.cover_url].filter(Boolean).length,
      socialProfiles: socials.length,
      brandInterests: Array.isArray(profile?.nil_brand_interests) ? profile.nil_brand_interests.length : 0,
      sport: athlete?.sport || null,
      position: athlete?.position || null,
      graduationYear: athlete?.graduation_year || null,
      highlightFilm: Boolean(athlete?.highlight_url),
    });
  }

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login?next=/recruiting/nil/media-kit");
        return;
      }
      setOwnerId(auth.user.id);
      try {
        await loadWorkspace(auth.user.id);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "NIL media kit workspace could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  async function createShare() {
    if (!ownerId) return;
    if (!Object.values(packet).some(Boolean)) {
      setError("Choose at least one section to include.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    const days = expiry === "never" ? null : Number(expiry);
    const expiresAt = days === null ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error: createError } = await supabase.rpc("create_nil_media_kit_share", {
      requested_packet: packet,
      requested_expires_at: expiresAt,
    });

    if (createError) {
      setError(createError.message);
      setSaving(false);
      return;
    }

    try {
      await loadWorkspace(ownerId);
      const row = Array.isArray(data) ? data[0] as { share_id?: string } | undefined : undefined;
      setMessage(row?.share_id ? "NIL media kit share created. Copy the private-by-link URL from the active shares below." : "NIL media kit share created.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Share created, but the workspace could not refresh.");
    } finally {
      setSaving(false);
    }
  }

  async function revokeShare(shareId: string) {
    setSaving(true);
    setError("");
    setMessage("");
    const { data, error: revokeError } = await supabase.rpc("revoke_portfolio_share", { requested_share_id: shareId });
    if (revokeError || data !== true) {
      setError(revokeError?.message || "This share could not be revoked.");
      setSaving(false);
      return;
    }
    try {
      await loadWorkspace(ownerId);
      setMessage("Share revoked. Its public URL no longer resolves.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Share revoked, but the workspace could not refresh.");
    } finally {
      setSaving(false);
    }
  }

  async function copyShare(shareId: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/portfolio/${shareId}`);
      setMessage("Share URL copied.");
    } catch {
      setError("The browser could not copy the share URL. Open the share and copy the address from your browser.");
    }
  }

  if (loading) return <PlaybookPage><div style={loadingState}>Connecting your NIL media-kit workspace…</div></PlaybookPage>;

  const activeShares = shares.filter((share) => share.viewable);

  return (
    <PlaybookPage>
      <div data-testid="nil-media-kit" data-visual-canon="PGNM-001">
        <PlaybookHero
          eyebrow="NIL Media Kit"
          title="Share your story without sharing your whole record."
          subtitle="Compose a partner-facing view from the profile, athlete, social, and media facts you already own in Playbook. Your media kit is a live projection: the share stores your section choices, not copied source data."
        >
          <div style={heroActions}>
            <PlaybookButton href="/recruiting/nil/preparation">NIL Preparation</PlaybookButton>
            <PlaybookButton href="/recruiting/nil" variant="secondary">NIL Deals</PlaybookButton>
            <PlaybookButton href="/profile" variant="secondary">Edit Source Profile</PlaybookButton>
          </div>
        </PlaybookHero>

        {error ? <div role="alert" style={errorState}>{error}</div> : null}
        {message ? <div role="status" style={successState}>{message}</div> : null}

        <PlaybookMetrics>
          <PlaybookMetric label="Active shares" value={String(activeShares.length)} />
          <PlaybookMetric label="Social profiles" value={String(source?.socialProfiles || 0)} />
          <PlaybookMetric label="Brand interests" value={String(source?.brandInterests || 0)} />
          <PlaybookMetric label="Highlight film" value={source?.highlightFilm ? "Connected" : "Not connected"} />
        </PlaybookMetrics>

        <section style={trustPanel}>
          <PlaybookPill>Private by default · explicit publication</PlaybookPill>
          <h2 style={trustTitle}>A share URL is a projection, not Scholar Record access.</h2>
          <p style={trustCopy}>Only the sections you turn on below can resolve through the opaque URL. NIL deals, compensation, contracts, disclosures, tax details, eligibility evidence, private reflections, contact email, household data, and support relationships are never part of this resolver.</p>
        </section>

        <div style={workspaceGrid}>
          <section style={panel} aria-labelledby="compose-heading">
            <PlaybookPill>Compose</PlaybookPill>
            <h2 id="compose-heading" style={sectionTitle}>Choose what the partner can see</h2>
            <p style={muted}>The source data stays in its canonical Playbook owner. Change your profile or athlete record later and an active share reflects the current selected fields.</p>

            <div style={sourceCard}>
              <strong>{source?.displayName || "Scholar"}</strong>
              <span>{source?.sport || "Sport not recorded"}{source?.position ? ` · ${source.position}` : ""}{source?.graduationYear ? ` · Class of ${source.graduationYear}` : ""}</span>
              <span>{source?.bio ? "Bio ready" : "Bio not recorded"} · {source?.profileMedia || 0}/2 profile media basics · {source?.socialProfiles || 0} social links</span>
            </div>

            <div style={sectionList}>
              {sections.map(([key, label, copy]) => (
                <label key={key} style={sectionToggle}>
                  <input type="checkbox" checked={Boolean(packet[key])} onChange={(event) => setPacket((current) => ({ ...current, [key]: event.target.checked }))} />
                  <span><strong>{label}</strong><small>{copy}</small></span>
                </label>
              ))}
            </div>

            <label style={field}>Share lifetime
              <select value={expiry} onChange={(event) => setExpiry(event.target.value)} style={input}>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="never">No scheduled expiry</option>
              </select>
            </label>

            <button type="button" disabled={saving} onClick={() => void createShare()} style={primaryButton}>{saving ? "Creating governed share…" : "Create NIL media kit share"}</button>
          </section>

          <section style={panel} aria-labelledby="shares-heading">
            <PlaybookPill>Lifecycle</PlaybookPill>
            <h2 id="shares-heading" style={sectionTitle}>Your NIL media-kit shares</h2>
            {shares.length === 0 ? (
              <div style={emptyState}><strong>No media-kit shares yet.</strong><p style={muted}>Nothing is publicly resolvable until you explicitly create a share.</p></div>
            ) : (
              <div style={shareList}>{shares.map((share) => (
                <article key={share.share_id} style={shareCard}>
                  <div style={shareHeader}><span style={statusBadge(share.viewable ? "active" : share.status)}>{share.viewable ? "Active" : share.expiredByTime && share.status === "active" ? "Expired" : formatLabel(share.status)}</span><small>{formatDate(share.created_at)}</small></div>
                  <p style={shareId}>…{share.share_id.slice(-12)}</p>
                  <p style={muted}>{share.expires_at ? `Expires ${formatDate(share.expires_at)}` : "No scheduled expiry"}</p>
                  <div style={shareActions}>
                    {share.viewable ? <button type="button" onClick={() => void copyShare(share.share_id)} style={secondaryButton}>Copy URL</button> : null}
                    {share.viewable ? <a href={`/portfolio/${share.share_id}`} target="_blank" rel="noreferrer" style={secondaryLink}>Preview</a> : null}
                    {share.viewable ? <button type="button" disabled={saving} onClick={() => void revokeShare(share.share_id)} style={dangerButton}>Revoke</button> : null}
                  </div>
                </article>
              ))}</div>
            )}
          </section>
        </div>
      </div>
    </PlaybookPage>
  );
}

function formatLabel(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(); }
function statusBadge(status: string): React.CSSProperties { return { ...badge, background: status === "active" ? "#ECFDF5" : status === "revoked" ? "#FEF2F2" : "#F1F5F9", color: status === "active" ? "#047857" : status === "revoked" ? "#B91C1C" : "#475569" }; }

const loadingState: React.CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "#52657B", fontWeight: 800 };
const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 };
const errorState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 15, borderRadius: 14, background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B" };
const successState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 15, borderRadius: 14, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", fontWeight: 800 };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: "clamp(22px,4vw,34px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFFFFF" };
const trustTitle: React.CSSProperties = { margin: "12px 0 8px", fontSize: "clamp(26px,4vw,40px)" };
const trustCopy: React.CSSProperties = { margin: 0, maxWidth: 900, color: "#C9D8E8", lineHeight: 1.65 };
const workspaceGrid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 30px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,390px),1fr))", gap: 18, alignItems: "start" };
const panel: React.CSSProperties = { padding: "clamp(20px,3vw,30px)", borderRadius: 24, background: "#FFFFFF", border: "1px solid #DDE6EF", boxShadow: "0 14px 44px rgba(15,23,42,.05)" };
const sectionTitle: React.CSSProperties = { margin: "12px 0 8px", color: "#102238", fontSize: "clamp(27px,4vw,38px)" };
const muted: React.CSSProperties = { color: "#61748A", lineHeight: 1.6 };
const sourceCard: React.CSSProperties = { display: "grid", gap: 6, margin: "18px 0", padding: 16, borderRadius: 16, background: "#F4F8FB", color: "#334E68", fontSize: 13 };
const sectionList: React.CSSProperties = { display: "grid", gap: 10, margin: "18px 0" };
const sectionToggle: React.CSSProperties = { display: "grid", gridTemplateColumns: "22px 1fr", gap: 10, alignItems: "start", padding: 13, border: "1px solid #E2E8F0", borderRadius: 13, color: "#20364E" };
const field: React.CSSProperties = { display: "grid", gap: 7, color: "#20364E", fontSize: 12, fontWeight: 900 };
const input: React.CSSProperties = { minHeight: 44, borderRadius: 12, border: "1px solid #CBD5E1", padding: "0 12px", background: "#FBFCFE", color: "#102238", font: "inherit" };
const primaryButton: React.CSSProperties = { width: "100%", minHeight: 48, marginTop: 14, border: 0, borderRadius: 999, background: "#F97316", color: "white", fontWeight: 950, cursor: "pointer" };
const emptyState: React.CSSProperties = { marginTop: 18, padding: 20, borderRadius: 16, background: "#F4F8FB", border: "1px dashed #B8C9D8", color: "#20364E" };
const shareList: React.CSSProperties = { display: "grid", gap: 12, marginTop: 18 };
const shareCard: React.CSSProperties = { padding: 16, borderRadius: 16, border: "1px solid #E2E8F0", background: "#FBFCFE" };
const shareHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 10, color: "#718399" };
const badge: React.CSSProperties = { padding: "5px 8px", borderRadius: 999, fontSize: 10, fontWeight: 950, textTransform: "uppercase", letterSpacing: ".06em" };
const shareId: React.CSSProperties = { margin: "12px 0 4px", color: "#102238", fontFamily: "monospace", fontWeight: 850 };
const shareActions: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 };
const secondaryButton: React.CSSProperties = { minHeight: 38, borderRadius: 999, border: "1px solid #CBD5E1", padding: "0 12px", background: "#FFFFFF", color: "#20364E", fontWeight: 850, cursor: "pointer" };
const secondaryLink: React.CSSProperties = { ...secondaryButton, display: "inline-flex", alignItems: "center", textDecoration: "none" };
const dangerButton: React.CSSProperties = { ...secondaryButton, borderColor: "#FECACA", color: "#B91C1C" };

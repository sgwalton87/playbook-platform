"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type ResolvedShare = {
  share_id: string;
  target_use: string;
  expires_at: string | null;
  packet: Record<string, boolean>;
  scholar: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    socialLinks?: Record<string, string>;
    brandInterests?: string[];
  };
  athlete: {
    sport?: string;
    position?: string;
    secondaryPosition?: string;
    graduationYear?: number;
    highlightUrl?: string;
  };
  media: {
    profileMediaCount?: number;
  };
};

export default function SharedPortfolioPage() {
  const params = useParams<{ shareId: string }>();
  const shareId = params?.shareId || "";
  const [share, setShare] = useState<ResolvedShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadShare() {
      setLoading(true);
      setError("");
      const { data, error: resolveError } = await supabase.rpc("resolve_portfolio_share", {
        requested_share_id: shareId,
      });

      if (!active) return;
      if (resolveError) {
        setError("This portfolio share could not be resolved.");
        setLoading(false);
        return;
      }

      const row = Array.isArray(data) ? data[0] : null;
      setShare((row as ResolvedShare | undefined) || null);
      setLoading(false);
    }

    if (shareId) void loadShare();
    else setLoading(false);
    return () => { active = false; };
  }, [shareId]);

  if (loading) {
    return <PlaybookPage><div style={statePanel}>Resolving this governed portfolio share…</div></PlaybookPage>;
  }

  if (error || !share) {
    return (
      <PlaybookPage>
        <PlaybookHero
          eyebrow="Shared Portfolio"
          title="Portfolio unavailable"
          subtitle="This share is invalid, revoked, expired, or no longer available. Playbook does not reveal the underlying Scholar Record when a share cannot be resolved."
        />
        <div role={error ? "alert" : undefined} style={statePanel}>{error || "No active share was found."}</div>
      </PlaybookPage>
    );
  }

  const scholar = share.scholar || {};
  const athlete = share.athlete || {};
  const socialEntries = Object.entries(scholar.socialLinks || {}).filter(([, value]) => Boolean(value));
  const interests = Array.isArray(scholar.brandInterests) ? scholar.brandInterests : [];

  return (
    <PlaybookPage>
      <div data-testid="governed-portfolio-share" data-target-use={share.target_use}>
        <PlaybookHero
          eyebrow={share.target_use === "nil" ? "NIL Media Kit" : "Shared Portfolio"}
          title={`${scholar.displayName || "Scholar"} · ${share.target_use === "nil" ? "Partner Media Kit" : "Portfolio"}`}
          subtitle="This page is a Scholar-controlled live projection of selected Playbook records. It is not a grant of access to the underlying Scholar Record."
        />

        <section style={trustPanel}>
          <PlaybookPill>Scholar-controlled share</PlaybookPill>
          <p style={trustCopy}>Only the sections selected when this opaque share was created are visible here. Revoking or expiring the share removes public access without deleting the Scholar&apos;s source records.</p>
          {share.expires_at ? <span style={expiry}>Expires {formatDateTime(share.expires_at)}</span> : <span style={expiry}>No scheduled expiry</span>}
        </section>

        <PlaybookGrid min={310}>
          {(scholar.bio || scholar.avatarUrl || scholar.coverUrl) ? (
            <PlaybookCard eyebrow="Identity" title={scholar.displayName || "Scholar"}>
              {scholar.bio ? <p style={body}>{scholar.bio}</p> : null}
              <div style={linkRow}>
                {scholar.avatarUrl ? <a href={scholar.avatarUrl} target="_blank" rel="noreferrer" style={link}>Profile photo</a> : null}
                {scholar.coverUrl ? <a href={scholar.coverUrl} target="_blank" rel="noreferrer" style={link}>Cover media</a> : null}
              </div>
            </PlaybookCard>
          ) : null}

          {Object.keys(athlete).length > 0 ? (
            <PlaybookCard eyebrow="Athlete Profile" title={athlete.sport || "Athlete"}>
              {athlete.position ? <p style={body}><strong>Position:</strong> {athlete.position}{athlete.secondaryPosition ? ` / ${athlete.secondaryPosition}` : ""}</p> : null}
              {athlete.graduationYear ? <p style={body}><strong>Graduation year:</strong> {athlete.graduationYear}</p> : null}
              {athlete.highlightUrl ? <a href={athlete.highlightUrl} target="_blank" rel="noreferrer" style={link}>Watch highlight film →</a> : null}
            </PlaybookCard>
          ) : null}

          {socialEntries.length > 0 ? (
            <PlaybookCard eyebrow="Social Presence" title="Published profiles">
              <div style={stack}>{socialEntries.map(([network, value]) => <a key={network} href={value} target="_blank" rel="noreferrer" style={link}>{formatLabel(network)} →</a>)}</div>
              <p style={finePrint}>Playbook displays only links the Scholar chose to include. Account presence is not a professionalism or suitability score.</p>
            </PlaybookCard>
          ) : null}

          {interests.length > 0 ? (
            <PlaybookCard eyebrow="Partnership Fit" title="Brand interests">
              <div style={pillRow}>{interests.map((interest) => <PlaybookPill key={interest}>{interest}</PlaybookPill>)}</div>
            </PlaybookCard>
          ) : null}

          {typeof share.media?.profileMediaCount === "number" ? (
            <PlaybookCard eyebrow="Media Library" title="Source material available">
              <p style={bigNumber}>{share.media.profileMediaCount}</p>
              <p style={body}>profile media item{share.media.profileMediaCount === 1 ? "" : "s"} recorded in Playbook. This count does not expose private media files.</p>
            </PlaybookCard>
          ) : null}
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "on the configured date" : date.toLocaleString();
}

const statePanel: React.CSSProperties = { maxWidth: 1180, margin: "30px auto", padding: 28, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#52657B" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: 22, borderRadius: "8px 24px 8px 24px", background: "#081D34", color: "#FFFFFF" };
const trustCopy: React.CSSProperties = { maxWidth: 820, color: "#C9D8E8", lineHeight: 1.65 };
const expiry: React.CSSProperties = { display: "inline-block", marginTop: 4, color: "#FFB078", fontSize: 12, fontWeight: 850 };
const body: React.CSSProperties = { color: "#52657B", lineHeight: 1.65 };
const finePrint: React.CSSProperties = { color: "#718399", fontSize: 12, lineHeight: 1.55 };
const linkRow: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };
const stack: React.CSSProperties = { display: "grid", gap: 9 };
const link: React.CSSProperties = { color: "#C2410C", fontWeight: 900, textDecoration: "none" };
const pillRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8 };
const bigNumber: React.CSSProperties = { margin: "4px 0", color: "#102238", fontSize: 44, fontWeight: 950 };

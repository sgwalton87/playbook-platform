"use client";

import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";
import {
  buildPortfolioShare,
  canViewPortfolioShare,
} from "@/lib/portfolio-sharing";

export default function SharedPortfolioPage() {
  const share = buildPortfolioShare({
    scholarId: "scholar-record",
    scholarName: "Scholar",
    targetUse: "internship",
    packet: {
      resume: true,
      bragSheet: true,
      recommendationLetter: true,
    },
  });

  const allowed = canViewPortfolioShare(share);

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Shared Portfolio"
        title={allowed ? `${share.scholarName} Portfolio Packet` : "Portfolio unavailable"}
        subtitle="A shareable portfolio page for applications, scholarships, recruiting, internships, jobs, and NIL opportunities."
      />

      <PlaybookGrid>
        <PlaybookCard eyebrow="Share Status" title={share.status}>
          <p style={body}>Target use: {share.targetUse}</p>
          <PlaybookPill>{allowed ? "viewable" : "restricted"}</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Included Materials" title="Packet contents">
          <p style={body}>Resume: {String(share.packet.resume)}</p>
          <p style={body}>Brag Sheet: {String(share.packet.bragSheet)}</p>
          <p style={body}>Recommendation Letter: {String(share.packet.recommendationLetter)}</p>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

"use client";

import { useState } from "react";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";
import { buildRecommendationApproval } from "@/lib/portfolio-sharing";

export default function RecommenderApprovalPage() {
  const [status, setStatus] = useState<
    "draft_submitted" | "approved" | "revision_requested"
  >("draft_submitted");

  const approval = buildRecommendationApproval({
    requestId: "request-demo",
    recommenderName: "Coach Taylor",
    letterText: "Scholar is a disciplined scholar-athlete and emerging leader.",
    status,
  });

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Recommender Approval"
        title="Review, approve, or request revisions."
        subtitle="Recommenders can submit letters, scholars can approve final use, and teams can keep application materials organized."
      />

      <PlaybookGrid>
        <PlaybookCard eyebrow="Letter Status" title={approval.status.replaceAll("_", " ")}>
          <p style={body}>{approval.letterText}</p>
          <PlaybookPill>{approval.recommenderName}</PlaybookPill>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            <button style={button} onClick={() => setStatus("approved")}>
              Approve
            </button>
            <button style={secondary} onClick={() => setStatus("revision_requested")}>
              Request revision
            </button>
          </div>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

const button: React.CSSProperties = {
  background: "#F97316",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 999,
  padding: "10px 14px",
  fontWeight: 950,
  cursor: "pointer",
};

const secondary: React.CSSProperties = {
  ...button,
  background: "#FFFFFF",
  color: "#0F172A",
  border: "1px solid #E2E8F0",
};

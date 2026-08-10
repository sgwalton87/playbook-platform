"use client";

import {
  buildRecommenderEmail,
  buildRecommenderRequest,
  updateRecommenderRequestStatus,
} from "@/lib/recommenders";
import {
  buildPortfolioPdfPayload,
  buildPrintablePortfolioHtml,
  buildResumeProfile,
  buildBragSheet,
} from "@/lib/opportunity-toolkit";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function RecommenderWorkflowDashboard() {
  const request = buildRecommenderRequest({
    scholarId: "scholar-record",
    scholarName: "Scholar",
    recommenderName: "Coach Taylor",
    recommenderEmail: "coach@example.com",
    recommenderRole: "coach",
    opportunityName: "Health Careers Internship",
    evidence: ["Biology lab reflection", "Team captain leadership", "Verified transcript progress"],
  });

  const sentRequest = updateRecommenderRequestStatus(request, "sent");

  const email = buildRecommenderEmail({
    recommenderName: request.recommenderName,
    scholarName: request.scholarName,
    opportunityName: request.opportunityName,
    requestUrl: "https://playbook.local/recommenders",
  });

  const resume = buildResumeProfile({
    name: "Scholar",
    education: ["Oakland High School"],
    athletics: ["Varsity basketball"],
    leadership: ["Team captain"],
    skills: ["Leadership", "Communication"],
  });

  const bragSheet = buildBragSheet({
    scholarName: "Scholar",
    goals: ["College", "Health career pathway"],
    proudMoments: ["Academic improvement"],
    challengesOvercome: ["Balancing athletics and academics"],
    leadership: ["Team captain"],
    evidence: request.evidence,
  });

  const pdfPayload = buildPortfolioPdfPayload({
    scholarName: "Scholar",
    targetUse: "internship",
    resume,
    bragSheet,
    recommendationLetter: email.text,
  });

  const printableHtml = buildPrintablePortfolioHtml(pdfPayload);

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Beta 3.3 Sprint II"
        title="PDF Export + Recommender Workflow"
        subtitle="Create portfolio packets, request recommendation letters, share brag sheets, and prepare printable application materials."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Request Status" value={sentRequest.status.replaceAll("_", " ")} />
        <PlaybookMetric label="Evidence Items" value={String(request.evidence.length)} />
        <PlaybookMetric label="PDF Packet" value={pdfPayload.status.replaceAll("_", " ")} />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Recommender Request" title={request.recommenderName}>
          <p style={body}>{request.recommenderRole} for {request.opportunityName}</p>
          <PlaybookPill>{sentRequest.status}</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Request Email" title={email.subject}>
          <p style={body}>{email.text.slice(0, 260)}...</p>
          <PlaybookPill>email draft ready</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Portfolio PDF" title={pdfPayload.filename}>
          <p style={body}>Includes resume, brag sheet, and recommendation letter materials.</p>
          <PlaybookPill>{pdfPayload.status.replaceAll("_", " ")}</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Printable Export" title="HTML-to-PDF foundation">
          <p style={body}>Printable packet generated with {printableHtml.length} HTML characters.</p>
          <PlaybookPill>print ready</PlaybookPill>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

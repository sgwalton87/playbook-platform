"use client";

import {
  buildApplicationPlan,
  buildBragSheet,
  buildPortfolioPacket,
  buildRecommendationLetter,
  buildResumeProfile,
  getLetterRequestChecklist,
  scoreResumeReadiness,
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

export default function OpportunityToolkitDashboard() {
  const resume = buildResumeProfile({
    name: "Scholar",
    headline: "Scholar-athlete, future health leader, and community builder",
    education: ["Oakland High School — Class of 2027"],
    leadership: ["Peer mentor", "Team captain"],
    athletics: ["Varsity basketball"],
    awards: ["Academic growth recognition"],
    skills: ["Communication", "Leadership", "Research"],
    projects: ["Health careers pathway project"],
  });

  const readiness = scoreResumeReadiness(resume);

  const bragSheet = buildBragSheet({
    scholarName: "Scholar",
    goals: ["Attend college", "Explore health careers", "Earn scholarships"],
    proudMoments: ["Improved academic consistency", "Led teammates through adversity"],
    challengesOvercome: ["Balanced athletics and academics"],
    leadership: ["Team captain", "Peer mentor"],
    evidence: ["Biology lab reflection", "Verified transcript progress"],
  });

  const letter = buildRecommendationLetter({
    scholarName: "Scholar",
    recommenderName: "Coach Taylor",
    recommenderRole: "coach",
    opportunityName: "Health Careers Internship",
    strengths: ["discipline", "leadership", "resilience"],
    evidence: ["Consistent practice attendance", "Academic improvement", "Team leadership"],
  });

  const packet = buildPortfolioPacket({
    scholarName: "Scholar",
    resume,
    bragSheet,
    recommendationLetter: letter,
    evidenceLinks: ["Biology evidence", "Athletic profile"],
    targetUse: "internship",
  });

  const plan = buildApplicationPlan({
    opportunityName: "Health Careers Internship",
    opportunityType: "internship",
    deadline: "2026-09-01",
    missingItems: ["Final resume review", "Upload recommendation letter"],
  });

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Beta 3.3 — Opportunity Application Toolkit"
        title="Resume, recommendations, brag sheet, portfolio, and application support."
        subtitle="Playbook now helps scholars present themselves powerfully for colleges, scholarships, internships, jobs, recruiting, and NIL opportunities."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Resume Readiness" value={`${readiness.score}%`} />
        <PlaybookMetric label="Letter Checklist" value={`${getLetterRequestChecklist().length} steps`} />
        <PlaybookMetric label="Portfolio Packet" value={packet.exportStatus.replaceAll("_", " ")} />
        <PlaybookMetric label="Application Status" value={plan.status.replaceAll("_", " ")} />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Resume Builder" title={resume.name}>
          <p style={body}>{resume.headline}</p>
          <PlaybookPill>{readiness.filledSections}/{readiness.totalSections} sections filled</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Recommendation Letter Studio" title="Draft stronger letters">
          <p style={body}>{letter.slice(0, 220)}...</p>
          <PlaybookPill>draft ready</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Brag Sheet" title="Evidence for recommenders">
          <p style={body}>{bragSheet.summary}</p>
          <PlaybookPill>{bragSheet.evidence.length} evidence items</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Portfolio Export" title={packet.title}>
          <p style={body}>Target use: {packet.targetUse}</p>
          <PlaybookPill>{packet.exportStatus.replaceAll("_", " ")}</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Application Assistant" title={plan.opportunityName}>
          {plan.nextSteps.map((step) => (
            <p key={step} style={body}>✓ {step}</p>
          ))}
          <PlaybookPill>{plan.status.replaceAll("_", " ")}</PlaybookPill>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

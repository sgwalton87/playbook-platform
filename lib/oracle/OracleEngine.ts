import { buildAcademicIntelligenceReport, buildAcademicDNA } from "@/lib/academic-intelligence";
import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";
import { classifyOracleQuery } from "./OracleClassifier";
import type { OracleAnswer } from "./types";

export function askOracle(input: {
  question: string;
  courses?: any[];
  trustScore?: number;
}): OracleAnswer {
  const type = classifyOracleQuery(input.question);
  const courses = input.courses || [];

  const academic = buildAcademicIntelligenceReport(courses);
  const dna = buildAcademicDNA(courses);
  const opportunities = matchOpportunitiesFromSignals({
    skills: dna.strengths,
    majors: dna.interests,
    careers: dna.careerSignals,
    opportunities: dna.opportunitySignals,
  });

  if (type === "opportunities") {
    return {
      query: input.question,
      type,
      answer: `Oracle found ${opportunities.matches.length} matched opportunities with an average opportunity score of ${opportunities.score}%.`,
      evidence: opportunities.matches.slice(0, 3).map(m => m.opportunity.title),
      nextActions: ["Open Opportunity Marketplace", "Save top matches", "Choose one next step"],
    };
  }

  if (type === "academic") {
    return {
      query: input.question,
      type,
      answer: `Academic readiness is ${academic.score}%. A-G progress is ${academic.agProgress}% and graduation progress is ${academic.graduationProgress}%.`,
      evidence: academic.strengths,
      nextActions: academic.nextActions,
    };
  }

  if (type === "trust") {
    return {
      query: input.question,
      type,
      answer: `Current trust signal is ${input.trustScore || 40}%. Verification and evidence will strengthen the Playbook Record.`,
      evidence: ["Trust Layer", "Evidence Packs", "Verified achievements"],
      nextActions: ["Attach evidence", "Write reflection", "Request verification"],
    };
  }

  return {
    query: input.question,
    type,
    answer: "Oracle needs more specific context. Try asking about academics, opportunities, trust, or achievements.",
    evidence: [],
    nextActions: ["Ask a more specific question"],
  };
}

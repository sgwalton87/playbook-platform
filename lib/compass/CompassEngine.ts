import type { CompassReport } from "./types";
import { buildAcademicIntelligenceReport, buildAcademicDNA } from "@/lib/academic-intelligence";
import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";
import { buildCompassReasoning } from "./ReasoningEngine";
import { buildCompassRecommendations } from "./RecommendationEngine";
import { buildNextActions } from "./NextStepEngine";
import { inferCompassGoals } from "./GoalEngine";
import { explainCompassScore } from "./Explainability";

export function buildCompassReport(input: {
  courses?: LegacyValue[];
  trustScore?: number;
} = {}): CompassReport {
  const courses = input.courses || [];
  const academic = buildAcademicIntelligenceReport(courses);
  const dna = buildAcademicDNA(courses);

  const opportunities = matchOpportunitiesFromSignals({
    skills: dna.strengths,
    majors: dna.interests,
    careers: dna.careerSignals,
    opportunities: dna.opportunitySignals,
  });

  const reasoning = buildCompassReasoning({
    academicScore: academic.score,
    trustScore: input.trustScore || 40,
    opportunityScore: opportunities.score,
  });

  const goals = inferCompassGoals({ courses });

  const recommendations = buildCompassRecommendations({
    gaps: reasoning.gaps,
    opportunityTitles: opportunities.matches.map(m => m.opportunity.title),
  });

  return {
    score: reasoning.score,
    headline: reasoning.score >= 75 ? "You are building strong momentum." : "Your Playbook is ready to grow.",
    summary: `${explainCompassScore(reasoning.score)} ${goals[0] || ""}`.trim(),
    recommendations,
    nextActions: buildNextActions(recommendations),
  };
}

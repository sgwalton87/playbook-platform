import { buildAcademicDNA, buildAcademicIntelligenceReport } from "@/lib/academic-intelligence";
import { buildCompassReport } from "@/lib/compass";
import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";
import { askOracle } from "@/lib/oracle";

export function inspectLearnerIntelligence(courses: LegacyValue[], trustScore = 78) {
  const academic = buildAcademicIntelligenceReport(courses);
  const dna = buildAcademicDNA(courses);
  const opportunities = matchOpportunitiesFromSignals({
    skills: dna.strengths,
    majors: dna.interests,
    careers: dna.careerSignals,
    opportunities: dna.opportunitySignals,
  });
  const compass = buildCompassReport({ courses, trustScore });
  const oracle = askOracle({
    question: "What should this learner do next?",
    courses,
    trustScore,
  });

  return [
    { stage: "Transcript", status: "Parsed", output: `${courses.length} courses detected` },
    { stage: "Academic Intelligence", status: "Complete", output: `${academic.score}% academic score` },
    { stage: "Academic DNA", status: "Generated", output: `${dna.confidence}% confidence` },
    { stage: "Opportunity Graph", status: "Matched", output: `${opportunities.matches.length} opportunities` },
    { stage: "Compass", status: "Briefed", output: `${compass.recommendations.length} recommendations` },
    { stage: "Oracle", status: "Answered", output: oracle.answer },
  ];
}

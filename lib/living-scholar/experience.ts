import { buildAcademicDNA } from "@/lib/academic-intelligence";
import { buildCompassReport } from "@/lib/compass";
import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";
import { askOracle } from "@/lib/oracle";

export const livingScholarDemoCourses = [
  { name: "Biology", subject: "science", credits: 10, grade: "A", completed: true },
  { name: "Algebra II", subject: "math", credits: 10, grade: "B", completed: true },
  { name: "English 9", subject: "english", credits: 10, grade: "A", completed: true },
];

export function buildLivingScholarExperience(input: {
  name?: string;
  courses?: any[];
  trustScore?: number;
} = {}) {
  const name = input.name || "Maya";
  const courses = input.courses || livingScholarDemoCourses;
  const trustScore = input.trustScore || 78;

  const dna = buildAcademicDNA(courses);
  const compass = buildCompassReport({ courses, trustScore });
  const opportunities = matchOpportunitiesFromSignals({
    skills: dna.strengths,
    majors: dna.interests,
    careers: dna.careerSignals,
    opportunities: dna.opportunitySignals,
  });

  const oracle = askOracle({
    question: "What should I do next?",
    courses,
    trustScore,
  });

  const timeline = [
    "Transcript imported",
    "Academic DNA generated",
    "Opportunity Graph matched",
    "Compass briefing created",
    "Evidence strengthened Trust Layer",
  ];

  const growthScore = Math.round((dna.confidence + compass.score + opportunities.score + trustScore) / 4);

  return {
    name,
    trustScore,
    dna,
    compass,
    opportunities,
    oracle,
    timeline,
    growthScore,
    morningBrief: {
      headline: `Good morning, ${name}.`,
      summary: `Your Playbook is ${growthScore}% activated. Compass found ${compass.recommendations.length} recommendations and ${opportunities.matches.length} opportunity matches.`,
      focus: compass.nextActions[0] || "Add one new piece of evidence today.",
      impact: "+$4,200 estimated opportunity potential",
    },
  };
}

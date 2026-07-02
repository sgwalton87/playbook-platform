import type { OpportunityGraphReport, OpportunityMatch, OpportunityNode } from "../types";
import { OPPORTUNITY_ONTOLOGY } from "../ontology/OpportunityOntology";

function overlap(a: string[] = [], b: string[] = []) {
  const aa = a.map(x => x.toLowerCase());
  const bb = b.map(x => x.toLowerCase());
  return aa.filter(x => bb.includes(x));
}

export function matchOpportunitiesFromSignals(input: {
  skills?: string[];
  majors?: string[];
  careers?: string[];
  tags?: string[];
  opportunities?: string[];
}): OpportunityGraphReport {
  const skills = input.skills || [];
  const majors = input.majors || [];
  const careers = input.careers || [];
  const tags = [...(input.tags || []), ...(input.opportunities || [])];

  const matches: OpportunityMatch[] = OPPORTUNITY_ONTOLOGY.map((opportunity: OpportunityNode) => {
    const skillHits = overlap(skills, opportunity.skills);
    const majorHits = overlap(majors, opportunity.majors);
    const careerHits = overlap(careers, opportunity.careers);
    const tagHits = overlap(tags, opportunity.tags);

    const rawScore =
      skillHits.length * 20 +
      majorHits.length * 15 +
      careerHits.length * 12 +
      tagHits.length * 10;

    const score = Math.min(100, Math.round((rawScore + opportunity.readinessWeight) / 2));

    const reasons = [
      ...skillHits.map(skill => `Skill match: ${skill}`),
      ...majorHits.map(major => `Major pathway match: ${major}`),
      ...careerHits.map(career => `Career signal match: ${career}`),
      ...tagHits.map(tag => `Opportunity tag match: ${tag}`),
    ];

    return {
      opportunity,
      score,
      reasons,
      nextSteps: opportunity.nextSteps,
    };
  })
    .filter(match => match.score > 35 || match.reasons.length > 0)
    .sort((a, b) => b.score - a.score);

  return {
    score: matches.length ? Math.round(matches.slice(0, 5).reduce((sum, m) => sum + m.score, 0) / Math.min(5, matches.length)) : 0,
    matches,
    topSkills: skills.slice(0, 8),
    topMajors: majors.slice(0, 8),
    topCareers: careers.slice(0, 8),
    recommendations: matches.slice(0, 3).map(match => `Explore ${match.opportunity.title}.`),
  };
}

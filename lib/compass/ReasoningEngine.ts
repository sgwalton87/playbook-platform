export function buildCompassReasoning(input: {
  academicScore?: number;
  trustScore?: number;
  opportunityScore?: number;
}) {
  const academic = input.academicScore || 0;
  const trust = input.trustScore || 0;
  const opportunity = input.opportunityScore || 0;

  const score = Math.round((academic + trust + opportunity) / 3);

  return {
    score,
    strengths: [
      academic >= 70 && "Academic readiness is building.",
      trust >= 60 && "Trust signals are strengthening.",
      opportunity >= 60 && "Opportunity matches are active.",
    ].filter(Boolean) as string[],
    gaps: [
      academic < 70 && "Academic readiness needs more evidence.",
      trust < 60 && "Trust score can improve with verification.",
      opportunity < 60 && "Opportunity graph needs more learner signals.",
    ].filter(Boolean) as string[],
  };
}

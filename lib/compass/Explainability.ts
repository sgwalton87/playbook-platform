export function explainCompassScore(score: number) {
  if (score >= 85) return "Strong readiness. Compass recommends moving from preparation to action.";
  if (score >= 65) return "Good foundation. Compass recommends strengthening evidence and next steps.";
  return "Early stage. Compass recommends adding more records, evidence, and verified signals.";
}

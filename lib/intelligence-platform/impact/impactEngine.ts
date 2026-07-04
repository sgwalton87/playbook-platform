export function calculateImpact(changes: {
  academicDNA: number;
  opportunityScore: number;
  trustScore: number;
  scholarshipPotential: number;
}) {
  return {
    summary: `Academic DNA +${changes.academicDNA}%, Opportunity Score +${changes.opportunityScore}%, Trust +${changes.trustScore}%.`,
    scholarshipImpact: `+$${changes.scholarshipPotential.toLocaleString()} estimated scholarship potential`,
    totalSignalGain: changes.academicDNA + changes.opportunityScore + changes.trustScore,
  };
}

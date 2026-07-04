export function buildBragSheet(input: {
  scholarName: string;
  goals: string[];
  proudMoments: string[];
  challengesOvercome: string[];
  leadership: string[];
  evidence: string[];
}) {
  return {
    scholarName: input.scholarName,
    summary: `${input.scholarName} is preparing for future opportunities by documenting goals, growth, leadership, and verified evidence.`,
    goals: input.goals,
    proudMoments: input.proudMoments,
    challengesOvercome: input.challengesOvercome,
    leadership: input.leadership,
    evidence: input.evidence,
  };
}

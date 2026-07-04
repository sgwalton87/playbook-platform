export function explainImpact(input: {
  scenarioTitle: string;
  scholarshipImpact: string;
  totalSignalGain: number;
}) {
  return `If the learner completes "${input.scenarioTitle}", Playbook estimates ${input.scholarshipImpact} and a total intelligence signal gain of ${input.totalSignalGain} points.`;
}

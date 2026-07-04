export type IntelligenceEvent =
  | "transcript.imported"
  | "academic_dna.updated"
  | "opportunity.matched"
  | "trust.updated"
  | "goal.created"
  | "relationship.added"
  | "evidence.verified";

export type EngineName =
  | "academic"
  | "opportunity"
  | "compass"
  | "oracle"
  | "timeline"
  | "trust"
  | "role_os"
  | "ledger";

export function orchestrateIntelligenceEvent(event: {
  type: IntelligenceEvent;
  scholarId: string;
  payload?: Record<string, unknown>;
}) {
  const pipeline: EngineName[] = [
    "academic",
    "opportunity",
    "compass",
    "oracle",
    "timeline",
    "trust",
    "role_os",
    "ledger",
  ];

  return {
    event,
    status: "orchestrated",
    enginesTriggered: pipeline,
    summary: `${event.type} triggered ${pipeline.length} intelligence engines.`,
  };
}

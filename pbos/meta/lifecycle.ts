import type { ExplainableMetric, LifecycleAnalysis, MetaInput } from "./contracts";

export function analyzeLifecycle(input: MetaInput): LifecycleAnalysis {
  const metrics: ExplainableMetric[] = [];
  const stages = [...new Set(input.lifecycleHistory.map((record) => record.stage))].sort();
  for (const stage of stages) {
    const records = input.lifecycleHistory.filter((record) => record.stage === stage);
    const durations = records.map((record) => Date.parse(record.finishedAt) - Date.parse(record.startedAt));
    const evidence = records.flatMap((record) => record.evidenceReferences).filter((item, index, values) => values.indexOf(item) === index).sort();
    metrics.push({ metric: `${stage.toLowerCase()}-average-duration`, value: durations.reduce((sum, value) => sum + value, 0) / records.length, unit: "milliseconds", sourceEvidence: evidence, calculationMethod: "sum of recorded stage durations / recorded stage count", limitations: ["Duration does not establish the cause of delay."], confidence: records.length >= 2 ? "HIGH" : "MEDIUM", classification: "FACT" });
    metrics.push({ metric: `${stage.toLowerCase()}-blocked-count`, value: records.filter((record) => record.outcome === "BLOCKED").length, unit: "count", sourceEvidence: evidence, calculationMethod: "count of recorded BLOCKED outcomes for the stage", limitations: ["A repeated outcome is a pattern, not a causal conclusion."], confidence: "HIGH", classification: records.filter((record) => record.outcome === "BLOCKED").length >= 2 ? "PATTERN" : "FACT" });
  }
  const bottlenecks = stages.filter((stage) => input.lifecycleHistory.filter((record) => record.stage === stage && record.outcome === "BLOCKED").length >= 2).map((stage) => `${stage}: repeated blocked transitions observed.`);
  return { metrics: metrics.sort((left, right) => left.metric.localeCompare(right.metric)), bottlenecks, improvementOpportunities: bottlenecks.map((item) => `Consider governance review of ${item.split(":")[0]} evidence and transition requirements.`) };
}

import type { ExplainableMetric, GovernanceAnalysis, MetaInput } from "./contracts";

export function analyzeGovernance(input: MetaInput): GovernanceAnalysis {
  const records = input.governanceHistory;
  const evidenceReferences = records.flatMap((record) => record.evidenceReferences).filter((item, index, values) => values.indexOf(item) === index).sort();
  const resolved = records.filter((record) => record.resolvedAt);
  const delays = resolved.map((record) => Date.parse(record.resolvedAt!) - Date.parse(record.requestedAt));
  const metrics: ExplainableMetric[] = [
    { metric: "average-approval-delay", value: delays.length ? delays.reduce((sum, value) => sum + value, 0) / delays.length : 0, unit: "milliseconds", sourceEvidence: evidenceReferences, calculationMethod: "sum of resolvedAt minus requestedAt / resolved decision count", limitations: ["Elapsed time does not identify the cause of delay."], confidence: delays.length ? "HIGH" : "LOW", classification: "FACT" },
    { metric: "unresolved-decision-count", value: records.filter((record) => record.status === "PENDING").length, unit: "count", sourceEvidence: evidenceReferences, calculationMethod: "count of governance records with PENDING status", limitations: ["Pending status does not imply governance failure."], confidence: "HIGH", classification: "FACT" },
    { metric: "exception-count", value: records.filter((record) => record.status === "EXCEPTION").length, unit: "count", sourceEvidence: evidenceReferences, calculationMethod: "count of governance records classified as EXCEPTION", limitations: ["Exception frequency alone does not establish policy quality."], confidence: "HIGH", classification: "FACT" },
  ];
  const blockerCounts = new Map<string, number>();
  records.flatMap((record) => record.blockers).forEach((blocker) => blockerCounts.set(blocker, (blockerCounts.get(blocker) ?? 0) + 1));
  const observations = [...blockerCounts].filter(([, count]) => count >= 2).map(([blocker, count]) => `${blocker} occurred ${count} times.`).sort();
  return { metrics, observations, evidenceReferences, advisoryRecommendations: observations.map((observation) => `Consider human review of recurring governance observation: ${observation}`) };
}

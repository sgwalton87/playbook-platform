import type { EngineHealthSummary, ExplainableMetric, MetaInput } from "./contracts";

const percent = (part: number, total: number): number => total ? Math.round((part / total) * 10_000) / 100 : 0;

export function analyzeEngineHealth(input: MetaInput): EngineHealthSummary {
  const records = input.engineHistory;
  const evidence = records.flatMap((record) => record.evidenceReferences).filter((item, index, values) => values.indexOf(item) === index).sort();
  const unavailableEngines = [...input.expectedEngines].filter((engine) => !records.some((record) => record.engine === engine)).sort();
  const success = records.filter((record) => record.outcome === "SUCCESS").length;
  const blocked = records.filter((record) => record.outcome === "BLOCKED").length;
  const failures = records.filter((record) => record.outcome === "FAILURE").length;
  const complete = records.filter((record) => record.evidenceComplete).length;
  const metric = (name: string, value: number, method: string): ExplainableMetric => ({ metric: name, value, unit: "percent", sourceEvidence: evidence, calculationMethod: method, limitations: ["Metrics describe recorded history only; absent executions are not inferred."], confidence: records.length ? "HIGH" : "LOW", classification: "FACT" });
  const metrics = [
    metric("validation-success-rate", percent(success, records.length), "successful engine outcomes / all recorded engine outcomes × 100"),
    metric("blocked-frequency", percent(blocked, records.length), "blocked engine outcomes / all recorded engine outcomes × 100"),
    metric("failure-frequency", percent(failures, records.length), "failed engine outcomes / all recorded engine outcomes × 100"),
    metric("evidence-completeness", percent(complete, records.length), "evidence-complete outcomes / all recorded engine outcomes × 100"),
    metric("engine-availability", percent(input.expectedEngines.length - unavailableEngines.length, input.expectedEngines.length), "engines with recorded history / expected engines × 100"),
  ].sort((left, right) => left.metric.localeCompare(right.metric));
  return { status: unavailableEngines.length || failures ? "DEGRADED" : blocked ? "BLOCKED" : "HEALTHY", metrics, unavailableEngines };
}

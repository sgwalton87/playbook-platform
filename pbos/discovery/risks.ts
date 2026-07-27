import { digestValue } from "../context";
import type { DiscoveredSignal, DiscoveryRisk, RiskInput } from "./governed-contracts";
import { provenanceFromSignal } from "./provenance";

export function createRisk(signal: DiscoveredSignal, input: RiskInput): DiscoveryRisk {
  const body = { discoveredSignal: signal.signalId, evidenceReferences: [...signal.evidenceReferences].sort(), provenance: provenanceFromSignal(signal), confidenceLevel: signal.confidenceClassification, ...input, uncertaintyStatement: "This evidence-supported condition may create future impact; likelihood and causation are not established.", classification: "RISK" as const, advisoryOnly: true as const };
  return { riskId: `PBOS-DISC-RISK-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}

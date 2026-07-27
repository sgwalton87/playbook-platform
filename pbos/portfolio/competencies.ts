import { digestValue } from "../context";
import type { CompetencyConnection, PortfolioArtifact, PortfolioEvidence } from "./contracts";
export function connectCompetencies(artifacts: PortfolioArtifact[], evidence: PortfolioEvidence[]): CompetencyConnection[] {
  const evidenceById = new Map(evidence.map((item) => [item.evidenceId, item]));
  return artifacts.flatMap((artifact) => artifact.relatedCompetencies.map((competency) => {
    const verified = artifact.evidenceIds.every((id) => evidenceById.get(id)?.classification === "VERIFIED");
    const body = { artifactId: artifact.artifactId, competency, evidenceIds: [...artifact.evidenceIds].sort(), explanation: `This artifact demonstrates evidence related to this competency: ${competency}.`, confidence: verified ? "HIGH" as const : "LOW" as const, limitations: ["The connection describes available evidence and does not establish total capability or predict outcomes."], guaranteedOutcome: false as const };
    return { connectionId: `PBOS-PORT-COMP-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  })).sort((a, b) => a.connectionId.localeCompare(b.connectionId));
}

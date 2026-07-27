import { digestValue } from "../context";
import type { AdaptationInput, DetectedPattern, ImprovementProposal, ImprovementProposalDraft } from "./contracts";
import { AdaptationError, adaptationFailure } from "./errors";
import { governanceRoute } from "./routing";

export function createImprovementProposal(pattern: DetectedPattern, draft: ImprovementProposalDraft, input: AdaptationInput): ImprovementProposal {
  if (!pattern.supportingEvidence.length) throw new AdaptationError([adaptationFailure("MISSING_EVIDENCE", "Patterns require supporting evidence.")]);
  if (!pattern.sourceRecordIdentifiers.length || !input.autonomyObservations.length) throw new AdaptationError([adaptationFailure("MISSING_PROVENANCE", "Proposal provenance requires source records and observations.")]);
  if (draft.directModificationRequested) throw new AdaptationError([adaptationFailure("SELF_MODIFICATION", "Adaptation cannot directly modify PBOS or repository state.")]);
  if (!draft.improvementDescription.trim() || !draft.expectedImpact.trim() || !draft.risks.length) throw new AdaptationError([adaptationFailure("UNAUTHORIZED_CHANGE", "A bounded description, impact, and risks are required.")]);
  const requiredApprovals = governanceRoute(draft.changeType);
  const institutionalMemory = {
    sourceObservationIds: input.autonomyObservations.map((item) => item.observationId).sort(),
    sourceRecordIdentifiers: [...pattern.sourceRecordIdentifiers],
    evidenceReferences: [...pattern.supportingEvidence],
    historicalContext: input.lifecycleHistory.map((item) => `${item.gateIdentifier}:${item.outcome}`).sort(),
    decisionOutcomes: [],
    approvalRecords: [],
    lifecycleResults: [],
  };
  const body = {
    detectedPattern: pattern,
    supportingEvidence: [...pattern.supportingEvidence],
    affectedSystems: [...pattern.affectedSystems],
    improvementDescription: draft.improvementDescription,
    expectedImpact: draft.expectedImpact,
    risks: [...draft.risks].sort(),
    requiredApprovals,
    constitutionalConsiderations: [...draft.constitutionalConsiderations].sort(),
    confidenceClassification: pattern.occurrenceCount >= 3 ? "HIGH" as const : "MEDIUM" as const,
    governanceStatus: "PENDING_REVIEW" as const,
    advisoryOnly: true as const,
    institutionalMemory,
  };
  return { proposalId: `PBOS-PROP-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}

export function appendInstitutionalMemory(proposal: ImprovementProposal, update: { decisionOutcome?: string; approvalRecord?: string; lifecycleResult?: string }): ImprovementProposal {
  if (!update.decisionOutcome && !update.approvalRecord && !update.lifecycleResult) throw new AdaptationError([adaptationFailure("MISSING_PROVENANCE", "Institutional memory updates require an outcome reference.")]);
  return {
    ...proposal,
    institutionalMemory: {
      ...proposal.institutionalMemory,
      decisionOutcomes: [...proposal.institutionalMemory.decisionOutcomes, ...(update.decisionOutcome ? [update.decisionOutcome] : [])],
      approvalRecords: [...proposal.institutionalMemory.approvalRecords, ...(update.approvalRecord ? [update.approvalRecord] : [])],
      lifecycleResults: [...proposal.institutionalMemory.lifecycleResults, ...(update.lifecycleResult ? [update.lifecycleResult] : [])],
    },
  };
}

import { digestValue, type PBOSRuntimeContext } from "../context";
import type { LearningInput, LearnerEvidence } from "./contracts";
import { LearningError, learningFailure } from "./errors";

function validContext(context: PBOSRuntimeContext): boolean { const body = { ...context }; delete (body as Partial<PBOSRuntimeContext>).contextDigest; return context.documentInventory.length > 0 && context.contextDigest === digestValue(body); }
export function validateLearningInput(input: LearningInput): { context: PBOSRuntimeContext; evidence: LearnerEvidence[] } {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) throw new LearningError([learningFailure("INVALID_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  if (!input.authorizedLearnerIds.includes(input.learner.learnerId) || input.learnerEvidence.some((item) => item.learnerId !== input.learner.learnerId)) throw new LearningError([learningFailure("PRIVACY_VIOLATION", "Learner data requires explicit subject authorization and cannot be mixed across learners.")]);
  if (input.unauthorizedConclusionRequested) throw new LearningError([learningFailure("UNAUTHORIZED_CONCLUSION", "PBOS cannot determine potential, worth, admissions, career, or educational decisions.")]);
  if (input.rankingRequested) throw new LearningError([learningFailure("RANKING_PROHIBITED", "Learners cannot be ranked by human value or inferred potential.")]);
  if (input.highImpactDecisionRequested) throw new LearningError([learningFailure("HIGH_IMPACT_DECISION", "High-impact educational and access decisions require authorized humans.")]);
  if (Number.isNaN(Date.parse(input.generatedAt))) throw new LearningError([learningFailure("MISSING_EVIDENCE", "A valid report timestamp is required.")]);
  const evidence = input.learnerEvidence.filter((item) => item.verificationStatus === "VERIFIED");
  if (!evidence.length || evidence.some((item) => !item.evidenceId || !item.sourceReference || !item.owner || Number.isNaN(Date.parse(item.occurredAt)))) throw new LearningError([learningFailure("MISSING_EVIDENCE", "Verified learner evidence requires identity, provenance, ownership, and timestamp.")]);
  const digest = input.runtimeContext.contextDigest;
  if (!input.knowledgeReports.length || !input.strategyReports.length || !input.simulationReports.length || input.knowledgeReports.some((report) => report.runtimeContextDigest !== digest || !report.evidenceBundle.length) || input.strategyReports.some((report) => report.runtimeContextDigest !== digest || !report.evidenceBundle.length) || input.simulationReports.some((report) => report.runtimeContextDigest !== digest || !report.evidenceBundle.length)) throw new LearningError([learningFailure("MISSING_EVIDENCE", "Knowledge, strategy, and simulation inputs must be evidence-bound to the active context.")]);
  const evidenceById = new Map(evidence.map((item) => [item.evidenceId, item]));
  const referenced = [...input.competencyDrafts.flatMap((item) => item.sourceEvidenceIds), ...input.skillDrafts.flatMap((item) => item.evidenceIds), ...input.milestoneDrafts.flatMap((item) => item.supportingEvidenceIds), ...input.reflectionDrafts.flatMap((item) => item.supportingEvidenceIds), ...input.recommendationDrafts.flatMap((item) => item.evidenceIds)];
  if (referenced.some((id) => !evidenceById.has(id))) throw new LearningError([learningFailure("MISSING_EVIDENCE", "Learning artifacts may only cite verified evidence for the authorized learner.")]);
  const unauthorizedUse = (id: string, use: LearnerEvidence["authorizedUses"][number]) => !evidenceById.get(id)?.authorizedUses.includes(use);
  const exceedsAuthorizedUse =
    input.competencyDrafts.some((item) => item.sourceEvidenceIds.some((id) => unauthorizedUse(id, "LEARNING_RECORD"))) ||
    input.milestoneDrafts.some((item) => item.supportingEvidenceIds.some((id) => unauthorizedUse(id, "LEARNING_RECORD"))) ||
    input.reflectionDrafts.some((item) => item.supportingEvidenceIds.some((id) => unauthorizedUse(id, "LEARNING_RECORD"))) ||
    input.recommendationDrafts.some((item) => item.evidenceIds.some((id) => unauthorizedUse(id, "RECOMMENDATION")));
  if (exceedsAuthorizedUse) throw new LearningError([learningFailure("PRIVACY_VIOLATION", "Evidence use exceeds learner-authorized purposes.")]);
  const competencyNames = new Set(input.competencyDrafts.map(({ name }) => name));
  const milestoneObjectives = new Set(input.milestoneDrafts.map(({ objective }) => objective));
  const unresolvedReference =
    input.recommendationDrafts.some((item) => !competencyNames.has(item.relatedCompetencyName)) ||
    input.pathwayDrafts.some((item) => item.competencyNames.some((name) => !competencyNames.has(name)) || item.milestoneObjectives.some((objective) => !milestoneObjectives.has(objective)));
  if (unresolvedReference) throw new LearningError([learningFailure("MISSING_EVIDENCE", "Pathways and recommendations must reference modeled competencies and milestones.")]);
  return { context: input.runtimeContext, evidence };
}

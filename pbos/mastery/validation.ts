import { digestValue, type PBOSRuntimeContext } from "../context";
import type { MasteryEvidence, MasteryInput } from "./contracts";
import { MasteryError, masteryFailure } from "./errors";

function validContext(context: PBOSRuntimeContext): boolean { const body = { ...context }; delete (body as Partial<PBOSRuntimeContext>).contextDigest; return context.documentInventory.length > 0 && context.contextDigest === digestValue(body); }
export function validateMasteryInput(input: MasteryInput): { context: PBOSRuntimeContext; evidence: MasteryEvidence[] } {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) throw new MasteryError([masteryFailure("INVALID_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  if (!input.authorizedLearnerIds.includes(input.learnerId)) throw new MasteryError([masteryFailure("PRIVACY_VIOLATION", "Mastery evidence requires explicit learner authorization.")]);
  if (input.learningReports.some((report) => report.learner.learnerId !== input.learnerId) || input.evidence.some((item) => item.learnerId !== input.learnerId)) throw new MasteryError([masteryFailure("IDENTITY_MISMATCH", "Learning and mastery evidence must belong to the same learner.")]);
  if (input.rankingRequested) throw new MasteryError([masteryFailure("RANKING_PROHIBITED", "Mastery evidence cannot rank human value.")]);
  if (input.potentialInferenceRequested) throw new MasteryError([masteryFailure("POTENTIAL_INFERENCE", "Mastery evidence cannot determine intelligence, destiny, or total potential.")]);
  if (input.highImpactDecisionRequested) throw new MasteryError([masteryFailure("HIGH_IMPACT_DECISION", "Admissions, employment, certification, and access decisions require authorized humans.")]);
  if (Number.isNaN(Date.parse(input.generatedAt))) throw new MasteryError([masteryFailure("MISSING_EVIDENCE", "A valid report timestamp is required.")]);
  const digest = input.runtimeContext.contextDigest;
  if (!input.learningReports.length || !input.knowledgeReports.length || input.learningReports.some((report) => report.runtimeContextDigest !== digest || !report.evidenceBundle.length) || input.knowledgeReports.some((report) => report.runtimeContextDigest !== digest || !report.evidenceBundle.length)) throw new MasteryError([masteryFailure("MISSING_EVIDENCE", "Learning and knowledge inputs must be evidence-bound to the active context.")]);
  const evidence = input.evidence.filter((item) => item.verificationStatus === "VERIFIED");
  if (!evidence.length || evidence.some((item) => !item.evidenceId || !item.sourceReference || !item.owner || Number.isNaN(Date.parse(item.occurredAt)))) throw new MasteryError([masteryFailure("MISSING_EVIDENCE", "Verified evidence requires identity, source, owner, and timestamp.")]);
  const byId = new Map(evidence.map((item) => [item.evidenceId, item]));
  const references = [...input.demonstrationDrafts.flatMap((item) => item.evidenceIds), ...input.portfolioDraft.artifactEvidenceIds, ...input.portfolioDraft.reflectionEvidenceIds, ...input.achievementDrafts.flatMap((item) => item.evidenceIds), ...input.credentialDrafts.flatMap((item) => item.evidenceIds)];
  if (references.some((id) => !byId.has(id))) throw new MasteryError([masteryFailure("MISSING_EVIDENCE", "Mastery artifacts may only cite verified learner evidence.")]);
  const validationById = new Map(input.validations.map((item) => [item.validationId, item]));
  if (input.validations.some((item) => !input.approvedReviewerIds.includes(item.reviewerId) || !item.evidenceIds.length || !item.limitations.length || Number.isNaN(Date.parse(item.validationDate)))) throw new MasteryError([masteryFailure("UNAUTHORIZED_VALIDATION", "Validation requires an approved human reviewer, evidence, date, purpose, and limitations.")]);
  if ([...input.demonstrationDrafts.flatMap((item) => item.validationIds), ...input.portfolioDraft.validationIds].some((id) => !validationById.has(id))) throw new MasteryError([masteryFailure("UNAUTHORIZED_VALIDATION", "Demonstrations and portfolios may only cite recorded human validations.")]);
  const progressionRank: Record<import("./contracts").MasteryProgression, number> = { INTRODUCED: 0, DEVELOPING: 1, PRACTICED: 2, DEMONSTRATED: 3, ADVANCED: 4, RECOGNIZED_MASTERY: 5 };
  const unsupportedProgression = input.progressionRequests.some((request) => {
    const validatedReviews = request.validationIds.filter((id) => validationById.get(id)?.status === "VALIDATED").length;
    const requiredReviews = progressionRank[request.requestedProgression] >= 5 ? 3 : progressionRank[request.requestedProgression] >= 4 ? 2 : progressionRank[request.requestedProgression] >= 3 ? 1 : 0;
    return request.evidenceIds.some((id) => !byId.has(id)) || validatedReviews < requiredReviews || (progressionRank[request.requestedProgression] >= 3 && !request.evidenceIds.length);
  });
  if (unsupportedProgression) throw new MasteryError([masteryFailure("UNSUPPORTED_MASTERY", "Requested mastery progression exceeds available evidence or human validation.")]);
  const lacksPermission = (id: string, permission: MasteryEvidence["permissions"][number]) => !byId.get(id)?.permissions.includes(permission);
  if (input.demonstrationDrafts.some((item) => item.evidenceIds.some((id) => lacksPermission(id, "DEMONSTRATION"))) || input.portfolioDraft.artifactEvidenceIds.some((id) => lacksPermission(id, "PORTFOLIO")) || input.achievementDrafts.some((item) => item.evidenceIds.some((id) => lacksPermission(id, "ACHIEVEMENT"))) || input.credentialDrafts.some((item) => item.evidenceIds.some((id) => lacksPermission(id, "CREDENTIAL")))) throw new MasteryError([masteryFailure("PRIVACY_VIOLATION", "Evidence use exceeds learner-authorized permissions.")]);
  return { context: input.runtimeContext, evidence };
}

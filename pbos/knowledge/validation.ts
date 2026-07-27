import { digestValue, type PBOSRuntimeContext } from "../context";
import type { KnowledgeInput } from "./governed-contracts";
import { KnowledgeError, knowledgeFailure } from "./errors";

function validContext(context: PBOSRuntimeContext): boolean { const body = { ...context }; delete (body as Partial<PBOSRuntimeContext>).contextDigest; return context.documentInventory.length > 0 && context.contextDigest === digestValue(body); }
export function validateKnowledgeInput(input: KnowledgeInput): PBOSRuntimeContext {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) throw new KnowledgeError([knowledgeFailure("INVALID_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  if (input.fabricatedKnowledgeRequested) throw new KnowledgeError([knowledgeFailure("FABRICATED_KNOWLEDGE", "Knowledge cannot be created without source evidence.")]);
  if (input.historyModificationRequested) throw new KnowledgeError([knowledgeFailure("HISTORY_MODIFICATION", "Historical evidence and outcomes are immutable inputs.")]);
  if (Number.isNaN(Date.parse(input.generatedAt))) throw new KnowledgeError([knowledgeFailure("INVALID_EVIDENCE", "Knowledge generation timestamp is invalid.")]);
  if (input.historicalRecords.some((record) => !record.recordId || !record.owner || !record.summary || !record.evidenceReferences.length || Number.isNaN(Date.parse(record.occurredAt)))) throw new KnowledgeError([knowledgeFailure("MISSING_PROVENANCE", "Historical records require identity, ownership, timestamp, summary, and evidence.")]);
  if (input.institutionalMemory.some((memory) => !memory.sourceRecordIdentifiers.length || !memory.evidenceReferences.length)) throw new KnowledgeError([knowledgeFailure("MISSING_PROVENANCE", "Institutional memory requires historical source identifiers and evidence.")]);
  if (input.entityInputs.some((entity) => !entity.sourceRecordId || !entity.owner || !entity.sourceEvidence.length || Number.isNaN(Date.parse(entity.timestamp)))) throw new KnowledgeError([knowledgeFailure("MISSING_PROVENANCE", "Every entity requires source record, ownership, timestamp, and evidence.")]);
  if (input.strategyReports.some((report) => report.runtimeContextDigest !== input.runtimeContext!.contextDigest || !report.evidenceBundle.length) || input.discoveryReports.some((report) => report.runtimeContextDigest !== input.runtimeContext!.contextDigest || !report.evidenceBundle.length)) throw new KnowledgeError([knowledgeFailure("INVALID_EVIDENCE", "Intelligence reports require evidence and the active Runtime Context.")]);
  const sourceIds = new Set([...input.historicalRecords.map((record) => record.recordId), ...input.strategyReports.map((report) => report.reportId), ...input.discoveryReports.map((report) => report.reportId)]);
  if (input.entityInputs.some((entity) => !sourceIds.has(entity.sourceRecordId))) throw new KnowledgeError([knowledgeFailure("FABRICATED_KNOWLEDGE", "Every entity must identify an ingested historical or intelligence source record.")]);
  const sourceEvidence = new Set([...input.historicalRecords.flatMap((record) => record.evidenceReferences), ...input.institutionalMemory.flatMap((memory) => memory.evidenceReferences), ...input.strategyReports.flatMap((report) => report.evidenceBundle), ...input.discoveryReports.flatMap((report) => report.evidenceBundle)]);
  const referencedEvidence = [...input.entityInputs.flatMap((entity) => entity.sourceEvidence), ...input.relationshipInputs.flatMap((relationship) => relationship.evidenceReferences), ...input.precedentInputs.flatMap((precedent) => precedent.evidenceReferences), ...input.lessonInputs.flatMap((lesson) => lesson.originatingEvidence)];
  if (referencedEvidence.some((reference) => !sourceEvidence.has(reference))) throw new KnowledgeError([knowledgeFailure("FABRICATED_KNOWLEDGE", "Knowledge artifacts may only cite evidence present in ingested sources.")]);
  return input.runtimeContext;
}

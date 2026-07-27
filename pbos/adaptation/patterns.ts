import { digestValue, type PBOSRuntimeContext } from "../context";
import type { AdaptationInput, DetectedPattern, HistoricalEvidenceRecord } from "./contracts";
import { AdaptationError, adaptationFailure } from "./errors";

function expectedContextDigest(context: PBOSRuntimeContext): string {
  const { contextDigest: _contextDigest, ...digestInput } = context;
  return digestValue(digestInput);
}

export function detectAdaptationPatterns(input: AdaptationInput): DetectedPattern[] {
  const context = input.runtimeContext;
  if (!context || context.contextDigest !== expectedContextDigest(context)) throw new AdaptationError([adaptationFailure("INVALID_CONTEXT", "Verified Runtime Context is required.")]);
  if (!context.documentInventory.length) throw new AdaptationError([adaptationFailure("INVALID_CONTEXT", "Runtime Context lacks constitutional authority.")]);
  const invalidEvidence = input.historicalEvidence.filter((record) => !record.evidenceReferences.length || Number.isNaN(Date.parse(record.observedAt)));
  if (invalidEvidence.length) throw new AdaptationError([adaptationFailure("MISSING_EVIDENCE", "Historical signals require dated evidence references.")]);

  const groups = new Map<string, HistoricalEvidenceRecord[]>();
  for (const record of [...input.historicalEvidence].sort((left, right) => left.identifier.localeCompare(right.identifier))) {
    const key = `${record.signalType}\0${record.signal}\0${record.affectedSystem}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return [...groups.values()]
    .filter((records) => records.length >= 2)
    .map((records) => {
      const sourceRecordIdentifiers = records.map((record) => record.identifier).sort();
      const supportingEvidence = records.flatMap((record) => record.evidenceReferences).filter((item, index, values) => values.indexOf(item) === index).sort();
      const affectedSystems = records.map((record) => record.affectedSystem).filter((item, index, values) => values.indexOf(item) === index).sort();
      const body = { signalType: records[0].signalType, signal: records[0].signal, occurrenceCount: records.length, affectedSystems, sourceRecordIdentifiers, supportingEvidence, cause: "UNDETERMINED" as const };
      return { patternId: `PBOS-PAT-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
    })
    .sort((left, right) => left.patternId.localeCompare(right.patternId));
}

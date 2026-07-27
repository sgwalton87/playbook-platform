import { digestValue } from "../context";
import type { EmergingSignal, EmergingSignalDraft } from "./contracts";

export function aggregateEmergingSignals(drafts: EmergingSignalDraft[]): EmergingSignal[] {
  return drafts
    .map((draft) => {
      const body = {
        ...draft,
        sourceEvidence: [...draft.sourceEvidence].sort(),
        affectedSystems: [...draft.affectedSystems].sort(),
        limitations: [...draft.limitations].sort(),
        confidence: draft.recurrenceCount > 1 && draft.sourceEvidence.length > 1 ? "HIGH" as const : "MEDIUM" as const,
        uncertaintyStatement: "Recurrence may indicate an attention area; it does not establish cause or future occurrence.",
      };
      return { signalId: `PBOS-FOR-SIG-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
    })
    .sort((left, right) => left.signalId.localeCompare(right.signalId));
}

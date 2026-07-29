import type { VolumeCertificationArtifact } from "../constitution";
import type { VolumePromotionArtifact } from "../constitution/promotion";
import type { ContextRefreshArtifact } from "../context/schema";
import type { ExecutionAuthorizationRecord } from "../execution/authorization";
import type { ExecutionContract } from "../execution/contracts";
import type { CodexWorkPackage } from "../execution/work-package";
import type { LifecycleGovernanceArtifact } from "../lifecycle/governance";
import type { PlanningHandoffArtifact } from "../planning/handoff";
import type { ArtifactReconciliationArtifact } from "../reconciliation";
import type {
  InterfaceCertificationArtifact,
} from "../interface-certification/types";
import type {
  InterfaceMeasurementArtifact,
} from "../interface-certification/measurement/measurement-types";
import type { GateTransition } from "../lifecycle/contracts";

export interface ReleasePromotionArtifact {
  schemaVersion?: 1;
  owner?: "release-promotion";
  gateId: string;
  promoted: boolean;
  reason: string;
  timestamp: string;
  gateDigest?: string;
  contractDigest?: string;
  history?: {
    gateId: string;
    promoted: boolean;
    reason: string;
    timestamp: string;
    gateDigest?: string;
    contractDigest?: string;
  }[];
}

export type GateCompletionArtifact = GateTransition & {
  schemaVersion?: 1;
  owner?: "gate-lifecycle";
  history?: GateTransition[];
};

type Decoder<T> = (value: unknown) => T;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function records(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(record);
}

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function nullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function reject(label: string): never {
  throw new Error(`${label} runtime artifact failed schema validation.`);
}

function isVolumeCertificationArtifact(
  value: unknown
): value is VolumeCertificationArtifact {
  return (
    !record(value) ||
    value.schemaVersion !== 1
  )
    ? false
    : value.owner === "volume-certification" &&
        record(value.latest) &&
        records(value.history);
}

export const decodeVolumeCertificationArtifact: Decoder<
  VolumeCertificationArtifact
> = (value) =>
  isVolumeCertificationArtifact(value)
    ? value
    : reject("Volume certification");

function isVolumePromotionArtifact(
  value: unknown
): value is VolumePromotionArtifact {
  return (
    record(value) &&
    value.schemaVersion === 1 &&
    value.owner === "volume-promotion" &&
    record(value.latest) &&
    records(value.history)
  );
}

export const decodeVolumePromotionArtifact: Decoder<VolumePromotionArtifact> = (
  value
) =>
  isVolumePromotionArtifact(value) ? value : reject("Volume promotion");

function isContextRefreshArtifact(
  value: unknown
): value is ContextRefreshArtifact {
  return (
    record(value) &&
    value.version === "1.0.0" &&
    value.owner === "repository-context" &&
    record(value.latest) &&
    records(value.history)
  );
}

export const decodeContextRefreshArtifact: Decoder<ContextRefreshArtifact> = (
  value
) => isContextRefreshArtifact(value) ? value : reject("Context refresh");

function isAuthorizationRecord(
  value: unknown
): value is ExecutionAuthorizationRecord {
  return (
    record(value) &&
    typeof value.id === "string" &&
    typeof value.version === "string" &&
    typeof value.contractId === "string" &&
    typeof value.workPackageId === "string" &&
    record(value.contract) &&
    record(value.workPackage) &&
    typeof value.gateId === "string" &&
    ["PENDING", "AUTHORIZED", "DENIED"].includes(String(value.status)) &&
    nullableString(value.approvedBy) &&
    nullableString(value.approvalReason) &&
    strings(value.evidenceReviewed) &&
    typeof value.createdAt === "string" &&
    nullableString(value.authorizedAt)
  );
}

export const decodeExecutionAuthorization: Decoder<
  ExecutionAuthorizationRecord
> = (value) =>
  isAuthorizationRecord(value)
    ? value
    : reject("Execution authorization");

function isExecutionContract(value: unknown): value is ExecutionContract {
  return (
    record(value) &&
    typeof value.id === "string" &&
    typeof value.version === "string" &&
    typeof value.gateId === "string" &&
    ["PENDING", "AUTHORIZED", "DENIED", "COMPLETED"].includes(
      String(value.authorization)
    ) &&
    typeof value.objective === "string" &&
    strings(value.allowedFiles) &&
    strings(value.blockedFiles) &&
    strings(value.allowedOperations) &&
    strings(value.requiredValidation) &&
    nullableString(value.rollbackReference) &&
    strings(value.evidenceRequirements) &&
    typeof value.createdAt === "string" &&
    nullableString(value.completedAt)
  );
}

export const decodeExecutionContract: Decoder<ExecutionContract> = (value) =>
  isExecutionContract(value) ? value : reject("Execution contract");

function isCodexWorkPackage(value: unknown): value is CodexWorkPackage {
  return (
    record(value) &&
    typeof value.id === "string" &&
    typeof value.version === "string" &&
    typeof value.gateId === "string" &&
    typeof value.objective === "string" &&
    typeof value.authorizationRequired === "boolean" &&
    strings(value.allowedFiles) &&
    strings(value.blockedFiles) &&
    strings(value.allowedOperations) &&
    strings(value.tasks) &&
    strings(value.requiredValidation) &&
    strings(value.evidenceRequirements) &&
    typeof value.createdAt === "string"
  );
}

export const decodeCodexWorkPackage: Decoder<CodexWorkPackage> = (value) =>
  isCodexWorkPackage(value) ? value : reject("Work package");

function isPlanningHandoffArtifact(
  value: unknown
): value is PlanningHandoffArtifact {
  return (
    record(value) &&
    value.version === "1.0.0" &&
    value.owner === "planning-handoff" &&
    record(value.latest) &&
    records(value.history)
  );
}

export const decodePlanningHandoffArtifact: Decoder<
  PlanningHandoffArtifact
> = (value) =>
  isPlanningHandoffArtifact(value) ? value : reject("Planning handoff");

function isLifecycleGovernanceArtifact(
  value: unknown
): value is LifecycleGovernanceArtifact {
  return (
    record(value) &&
    value.schemaVersion === 1 &&
    records(value.history) &&
    typeof value.runId === "string" &&
    typeof value.gateId === "string"
  );
}

export const decodeLifecycleGovernanceArtifact: Decoder<
  LifecycleGovernanceArtifact
> = (value) =>
  isLifecycleGovernanceArtifact(value)
    ? value
    : reject("Lifecycle governance");

function isArtifactReconciliationArtifact(
  value: unknown
): value is ArtifactReconciliationArtifact {
  return (
    record(value) &&
    value.schemaVersion === 1 &&
    value.owner === "artifact-reconciliation" &&
    records(value.history) &&
    typeof value.runId === "string"
  );
}

export const decodeArtifactReconciliationArtifact: Decoder<
  ArtifactReconciliationArtifact
> = (value) =>
  isArtifactReconciliationArtifact(value)
    ? value
    : reject("Artifact reconciliation");

function isInterfaceCertificationArtifact(
  value: unknown
): value is InterfaceCertificationArtifact {
  return (
    record(value) &&
    value.schemaVersion === 1 &&
    value.owner === "interface-certification" &&
    records(value.history) &&
    typeof value.runId === "string"
  );
}

export const decodeInterfaceCertificationArtifact: Decoder<
  InterfaceCertificationArtifact
> = (value) =>
  isInterfaceCertificationArtifact(value)
    ? value
    : reject("Interface certification");

function isInterfaceMeasurementArtifact(
  value: unknown
): value is InterfaceMeasurementArtifact {
  return (
    record(value) &&
    value.schemaVersion === 1 &&
    value.owner === "interface-measurement" &&
    records(value.history) &&
    typeof value.runId === "string"
  );
}

export const decodeInterfaceMeasurementArtifact: Decoder<
  InterfaceMeasurementArtifact
> = (value) =>
  isInterfaceMeasurementArtifact(value)
    ? value
    : reject("Interface measurement");

function isReleasePromotionArtifact(
  value: unknown
): value is ReleasePromotionArtifact {
  return (
    record(value) &&
    typeof value.gateId === "string" &&
    typeof value.promoted === "boolean" &&
    typeof value.reason === "string" &&
    typeof value.timestamp === "string" &&
    (value.history === undefined || records(value.history))
  );
}

export const decodeReleasePromotionArtifact: Decoder<
  ReleasePromotionArtifact
> = (value) =>
  isReleasePromotionArtifact(value)
    ? value
    : reject("Release promotion");

function isGateCompletionArtifact(
  value: unknown
): value is GateCompletionArtifact {
  return (
    record(value) &&
    typeof value.gateId === "string" &&
    typeof value.from === "string" &&
    typeof value.to === "string" &&
    typeof value.reason === "string" &&
    strings(value.evidence) &&
    typeof value.timestamp === "string" &&
    typeof value.contentIdentity === "string" &&
    (value.history === undefined || records(value.history))
  );
}

export const decodeGateCompletionArtifact: Decoder<
  GateCompletionArtifact
> = (value) =>
  isGateCompletionArtifact(value) ? value : reject("Gate completion");

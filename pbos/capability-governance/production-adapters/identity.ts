import { artifactDigest } from "../../kernel/identity";
import type {
  CapabilityProductionBridgeDecision,
  CapabilityProductionBridgeEvidence,
  ProductionEvidenceRecord,
  ProductionProof,
} from "./types";

function withoutDigest<T extends { readonly digest: string }>(
  value: T
): Omit<T, "digest"> {
  const { digest: _digest, ...content } = value;
  void _digest;
  return content;
}

export const productionProofDigest = (value: ProductionProof): string =>
  artifactDigest(withoutDigest(value));

export const productionEvidenceRecordDigest = (
  value: ProductionEvidenceRecord
): string => artifactDigest(withoutDigest(value));

export const productionBridgeEvidenceDigest = (
  value: CapabilityProductionBridgeEvidence
): string => artifactDigest(withoutDigest(value));

export const productionBridgeDecisionDigest = (
  value: CapabilityProductionBridgeDecision
): string => artifactDigest(withoutDigest(value));

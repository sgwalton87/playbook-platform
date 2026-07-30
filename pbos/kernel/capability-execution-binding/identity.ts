import { artifactDigest } from "../identity";
import type {
  CapabilityExecutionBindingContract,
  CapabilityExecutionBindingDecision,
  CapabilityExecutionBindingEvidence,
  ExecutionLifecycleProof,
} from "./types";

export const capabilityExecutionBindingDigest = (
  value: CapabilityExecutionBindingContract
): string => {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
};

export const executionLifecycleProofDigest = (
  value: ExecutionLifecycleProof
): string => {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
};

export const capabilityExecutionDecisionDigest = (
  value: CapabilityExecutionBindingDecision
): string => {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
};

export const capabilityExecutionEvidenceDigest = (
  value: CapabilityExecutionBindingEvidence
): string => {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
};

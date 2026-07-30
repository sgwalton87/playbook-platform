import { artifactDigest } from "../../kernel/identity";
import type {
  CertificationEvidenceChecklist,
  CertificationEvidenceRequirement,
  KernelProductionProofRequest,
  ProviderCertificationDecision,
  ProviderCertificationExecution,
  ProviderCertificationReview,
  ScholarRecordActivationReadiness,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const providerCertificationExecutionDigest = (
  value: ProviderCertificationExecution
): string => digestValue(value);
export const certificationEvidenceRequirementDigest = (
  value: CertificationEvidenceRequirement
): string => digestValue(value);
export const certificationEvidenceChecklistDigest = (
  value: CertificationEvidenceChecklist
): string => digestValue(value);
export const providerCertificationReviewDigest = (
  value: ProviderCertificationReview
): string => digestValue(value);
export const providerCertificationDecisionDigest = (
  value: ProviderCertificationDecision
): string => digestValue(value);
export const kernelProductionProofRequestDigest = (
  value: KernelProductionProofRequest
): string => digestValue(value);
export const scholarRecordActivationReadinessDigest = (
  value: ScholarRecordActivationReadiness
): string => digestValue(value);

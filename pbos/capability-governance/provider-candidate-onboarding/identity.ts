import { artifactDigest } from "../../kernel/identity";
import type {
  ProviderCandidateEvidenceRequirement,
  ProviderCandidateTransition,
  ProviderCertificationCandidate,
  ProviderCertificationEvidencePackage,
  ProviderCertificationReadinessAssessment,
  ProviderCertificationReviewAssignment,
  ProviderCertificationSubmissionPackage,
  ProviderProofReadinessAssessment,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const providerCertificationCandidateDigest = (
  value: ProviderCertificationCandidate
): string => digestValue(value);
export const providerCandidateTransitionDigest = (
  value: ProviderCandidateTransition
): string => digestValue(value);
export const providerCandidateEvidenceRequirementDigest = (
  value: ProviderCandidateEvidenceRequirement
): string => digestValue(value);
export const providerCertificationEvidencePackageDigest = (
  value: ProviderCertificationEvidencePackage
): string => digestValue(value);
export const providerCertificationReadinessDigest = (
  value: ProviderCertificationReadinessAssessment
): string => digestValue(value);
export const providerCertificationReviewAssignmentDigest = (
  value: ProviderCertificationReviewAssignment
): string => digestValue(value);
export const providerCertificationSubmissionPackageDigest = (
  value: ProviderCertificationSubmissionPackage
): string => digestValue(value);
export const providerProofReadinessDigest = (
  value: ProviderProofReadinessAssessment
): string => digestValue(value);

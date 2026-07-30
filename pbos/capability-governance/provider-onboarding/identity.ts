import { artifactDigest } from "../../kernel/identity";
import type {
  ProductionProviderEvidencePackage,
  ProductionProviderRegistration,
  ProviderCertificationReadinessAssessment,
  ProviderEvidenceValidation,
  ProviderLifecycleTransition,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const productionProviderRegistrationDigest = (
  value: ProductionProviderRegistration
): string => digestValue(value);
export const providerLifecycleTransitionDigest = (
  value: ProviderLifecycleTransition
): string => digestValue(value);
export const providerEvidencePackageDigest = (
  value: ProductionProviderEvidencePackage
): string => digestValue(value);
export const providerEvidenceValidationDigest = (
  value: ProviderEvidenceValidation
): string => digestValue(value);
export const providerReadinessAssessmentDigest = (
  value: ProviderCertificationReadinessAssessment
): string => digestValue(value);

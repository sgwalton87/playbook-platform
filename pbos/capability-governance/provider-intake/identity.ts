import { artifactDigest } from "../../kernel/identity";
import type {
  ProductionProviderIntakeRecord,
  ProviderEvidenceRequirementPackage,
  ProviderEvidenceSubmission,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const productionProviderIntakeDigest = (
  value: ProductionProviderIntakeRecord
): string => digestValue(value);
export const providerEvidenceRequirementPackageDigest = (
  value: ProviderEvidenceRequirementPackage
): string => digestValue(value);
export const providerEvidenceSubmissionDigest = (
  value: ProviderEvidenceSubmission
): string => digestValue(value);

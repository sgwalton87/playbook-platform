import { artifactDigest } from "../../kernel/identity";
import type {
  ProductionProviderEvaluation,
  ProviderEvidenceRequirementMatrix,
} from "./types";

export function productionProviderEvaluationDigest(
  value: ProductionProviderEvaluation
): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export function providerEvidenceRequirementMatrixDigest(
  value: ProviderEvidenceRequirementMatrix
): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

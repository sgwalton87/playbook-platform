import { artifactDigest } from "../identity";
import type {
  EngineActivationDecision,
  EngineActivationRequest,
  EngineActivationTrustProof,
  ProductionCertificationProof,
} from "./types";

function digestWithoutDigest<T extends { readonly digest: string }>(
  value: T
): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const engineActivationRequestDigest = (
  value: EngineActivationRequest
): string => digestWithoutDigest(value);

export const engineActivationTrustDigest = (
  value: EngineActivationTrustProof
): string => digestWithoutDigest(value);

export const productionCertificationProofDigest = (
  value: ProductionCertificationProof
): string => digestWithoutDigest(value);

export const engineActivationDecisionDigest = (
  value: EngineActivationDecision
): string => digestWithoutDigest(value);

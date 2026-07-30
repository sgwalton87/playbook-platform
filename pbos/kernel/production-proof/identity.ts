import { artifactDigest } from "../identity";
import type {
  KernelProductionProof,
  KernelProductionProofIssuanceRequest,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const kernelProductionProofIssuanceRequestDigest = (
  value: KernelProductionProofIssuanceRequest
): string => digestValue(value);
export const kernelProductionProofDigest = (
  value: KernelProductionProof
): string => digestValue(value);

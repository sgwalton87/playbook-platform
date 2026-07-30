import { artifactDigest } from "../../kernel/identity";
import type {
  CapabilityIssuerIdentityContract,
  CredentialValidationEvidence,
  IssuerTrustDecision,
  IssuerTrustRequest,
} from "./types";

export const issuerIdentityContractDigest = (
  value: CapabilityIssuerIdentityContract
): string => {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
};

export const credentialValidationEvidenceDigest = (
  value: CredentialValidationEvidence
): string => {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
};

export const issuerTrustRequestDigest = (
  value: IssuerTrustRequest
): string => {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
};

export const issuerTrustDecisionDigest = (
  value: IssuerTrustDecision
): string => {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
};

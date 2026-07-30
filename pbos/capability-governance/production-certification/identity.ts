import { artifactDigest } from "../../kernel/identity";
import type {
  ProductionEvidenceCertificationRecord,
  ProductionIdentityCertificationRecord,
  ProductionOperationsCertificationRecord,
  ProductionProviderCertificationDecision,
  ProductionProviderCertificationPackage,
  ProductionRecoveryCertificationRecord,
  ProductionSecurityCertificationRecord,
  ProductionStorageCertificationRecord,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const productionIdentityCertificationDigest = (
  value: ProductionIdentityCertificationRecord
): string => digestValue(value);
export const productionStorageCertificationDigest = (
  value: ProductionStorageCertificationRecord
): string => digestValue(value);
export const productionEvidenceCertificationDigest = (
  value: ProductionEvidenceCertificationRecord
): string => digestValue(value);
export const productionRecoveryCertificationDigest = (
  value: ProductionRecoveryCertificationRecord
): string => digestValue(value);
export const productionOperationsCertificationDigest = (
  value: ProductionOperationsCertificationRecord
): string => digestValue(value);
export const productionSecurityCertificationDigest = (
  value: ProductionSecurityCertificationRecord
): string => digestValue(value);
export const productionProviderPackageDigest = (
  value: ProductionProviderCertificationPackage
): string => digestValue(value);
export const productionProviderDecisionDigest = (
  value: ProductionProviderCertificationDecision
): string => digestValue(value);

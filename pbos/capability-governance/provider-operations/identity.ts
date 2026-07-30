import { artifactDigest } from "../../kernel/identity";
import type {
  CertificationQueueView,
  EvidenceStatusView,
  ProviderOperationsSnapshot,
  ProviderStatusView,
  ReviewerAssignmentView,
  RiskFindingView,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const providerStatusViewDigest = (value: ProviderStatusView): string =>
  digestValue(value);
export const evidenceStatusViewDigest = (value: EvidenceStatusView): string =>
  digestValue(value);
export const certificationQueueViewDigest = (
  value: CertificationQueueView
): string => digestValue(value);
export const riskFindingViewDigest = (value: RiskFindingView): string =>
  digestValue(value);
export const reviewerAssignmentViewDigest = (
  value: ReviewerAssignmentView
): string => digestValue(value);
export const providerOperationsSnapshotDigest = (
  value: ProviderOperationsSnapshot
): string => digestValue(value);

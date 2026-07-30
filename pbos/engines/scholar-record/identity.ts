import { artifactDigest } from "../../kernel/identity";
import type {
  ScholarRecord,
  ScholarRecordEntry,
  ScholarRecordMutation,
  ScholarRecordRevision,
  ScholarRecordActivationContract,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const scholarRecordEntryDigest = (value: ScholarRecordEntry): string =>
  digestValue(value);
export const scholarRecordRevisionDigest = (
  value: ScholarRecordRevision
): string => digestValue(value);
export const scholarRecordDigest = (value: ScholarRecord): string =>
  digestValue(value);
export const scholarRecordMutationDigest = (
  value: ScholarRecordMutation
): string => digestValue(value);
export const scholarRecordActivationContractDigest = (
  value: ScholarRecordActivationContract
): string => digestValue(value);

import { artifactDigest } from "../../../kernel/identity";
import type {
  ScholarOSApplicationArchitecture,
  ScholarOSApplicationModule,
  ScholarOSCapabilityMapping,
  ScholarOSScreenSpecification,
  ScholarOSUserFlowArchitecture,
  ScholarOSUserFlowStep,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const scholarOSCapabilityMappingDigest = (
  value: ScholarOSCapabilityMapping
): string => digestValue(value);
export const scholarOSApplicationModuleDigest = (
  value: ScholarOSApplicationModule
): string => digestValue(value);
export const scholarOSApplicationArchitectureDigest = (
  value: ScholarOSApplicationArchitecture
): string => digestValue(value);
export const scholarOSScreenSpecificationDigest = (
  value: ScholarOSScreenSpecification
): string => digestValue(value);
export const scholarOSUserFlowStepDigest = (
  value: ScholarOSUserFlowStep
): string => digestValue(value);
export const scholarOSUserFlowArchitectureDigest = (
  value: ScholarOSUserFlowArchitecture
): string => digestValue(value);

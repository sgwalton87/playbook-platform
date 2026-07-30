import { artifactDigest } from "../../kernel/identity";
import type {
  ExperienceCapability,
  ExperienceCapabilityDecision,
  ScholarDecisionBoundary,
  ScholarExperienceFact,
  ScholarHomeExperience,
  ScholarJourneyEvent,
  ScholarJourneyExperience,
  ScholarOSExperienceArchitecture,
  ScholarOSNavigationItem,
} from "./types";

function digestValue<T extends { readonly digest: string }>(value: T): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

export const scholarOSArchitectureDigest = (
  value: ScholarOSExperienceArchitecture
): string => digestValue(value);
export const experienceCapabilityDigest = (
  value: ExperienceCapability
): string => digestValue(value);
export const experienceCapabilityDecisionDigest = (
  value: ExperienceCapabilityDecision
): string => digestValue(value);
export const scholarExperienceFactDigest = (
  value: ScholarExperienceFact
): string => digestValue(value);
export const scholarHomeExperienceDigest = (
  value: ScholarHomeExperience
): string => digestValue(value);
export const scholarJourneyEventDigest = (
  value: ScholarJourneyEvent
): string => digestValue(value);
export const scholarJourneyExperienceDigest = (
  value: ScholarJourneyExperience
): string => digestValue(value);
export const scholarDecisionBoundaryDigest = (
  value: ScholarDecisionBoundary
): string => digestValue(value);
export const scholarOSNavigationItemDigest = (
  value: ScholarOSNavigationItem
): string => digestValue(value);

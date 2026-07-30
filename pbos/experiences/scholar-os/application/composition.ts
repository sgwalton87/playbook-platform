import {
  scholarOSApplicationArchitectureDigest,
  scholarOSApplicationModuleDigest,
  scholarOSCapabilityMappingDigest,
  scholarOSScreenSpecificationDigest,
  scholarOSUserFlowArchitectureDigest,
  scholarOSUserFlowStepDigest,
} from "./identity";
import {
  SCHOLAR_OS_MODULES,
  type ScholarOSApplicationArchitecture,
  type ScholarOSCapabilityMapping,
  type ScholarOSScreenSpecification,
  type ScholarOSUserFlowArchitecture,
} from "./types";
import type {
  ExperienceCapabilityDecision,
  ExperienceContext,
} from "../types";

const REQUIRED_SCREEN_STATES = [
  "LOADING",
  "EMPTY",
  "FIRST_TIME",
  "SUCCESS",
  "ERROR",
  "LOCKED",
  "PERMISSION_REQUIRED",
  "UNAVAILABLE",
] as const;

export function validateScholarOSApplication(
  value: ScholarOSApplicationArchitecture
): readonly string[] {
  const errors: string[] = [];
  if (value.digest !== scholarOSApplicationArchitectureDigest(value)) {
    errors.push("Scholar OS application digest is invalid.");
  }
  const moduleIds = new Set(value.modules.map(({ module_id }) => module_id));
  if (
    moduleIds.size !== SCHOLAR_OS_MODULES.length ||
    SCHOLAR_OS_MODULES.some((moduleId) => !moduleIds.has(moduleId))
  ) {
    errors.push("Scholar OS application modules are incomplete.");
  }
  for (const applicationModule of value.modules) {
    if (
      applicationModule.digest !==
        scholarOSApplicationModuleDigest(applicationModule) ||
      !applicationModule.purpose ||
      !applicationModule.user_value ||
      applicationModule.required_capabilities.length === 0 ||
      applicationModule.data_sources.length === 0 ||
      applicationModule.permissions.length === 0 ||
      REQUIRED_SCREEN_STATES.some(
        (state) => !applicationModule.available_states.includes(state)
      )
    ) {
      errors.push(
        `Scholar OS module is invalid: ${applicationModule.module_id}.`
      );
    }
  }
  if (
    new Set(value.navigation).size !== value.navigation.length ||
    value.navigation.some((moduleId) => !moduleIds.has(moduleId))
  ) {
    errors.push("Scholar OS navigation is invalid.");
  }
  for (const mapping of value.capability_mappings) {
    if (
      mapping.digest !== scholarOSCapabilityMappingDigest(mapping) ||
      !moduleIds.has(mapping.module_id) ||
      !mapping.permission_requirement ||
      (mapping.availability_state === "AVAILABLE" &&
        !mapping.kernel_decision_reference)
    ) {
      errors.push(`Scholar OS capability mapping is invalid: ${mapping.mapping_id}.`);
    }
  }
  return errors;
}

export function validateScholarOSScreen(
  value: ScholarOSScreenSpecification,
  mappings: readonly ScholarOSCapabilityMapping[]
): readonly string[] {
  const errors: string[] = [];
  if (value.digest !== scholarOSScreenSpecificationDigest(value)) {
    errors.push("Scholar OS screen digest is invalid.");
  }
  if (
    !value.purpose ||
    value.audience.length === 0 ||
    !value.primary_action ||
    value.information_hierarchy.length === 0 ||
    value.components.length === 0 ||
    value.data_displayed.length === 0 ||
    value.permissions.length === 0 ||
    value.capability_dependencies.length === 0 ||
    REQUIRED_SCREEN_STATES.some((state) => !value.states[state])
  ) {
    errors.push("Scholar OS screen specification is incomplete.");
  }
  for (const capabilityId of value.capability_dependencies) {
    const mapping = mappings.find(
      ({ module_id, capability_id }) =>
        module_id === value.module_id && capability_id === capabilityId
    );
    if (!mapping || mapping.availability_state === "UNAVAILABLE") {
      errors.push(`Scholar OS screen capability is unavailable: ${capabilityId}.`);
    }
  }
  return errors;
}

export function validateScholarOSUserFlow(
  value: ScholarOSUserFlowArchitecture,
  context: ExperienceContext,
  decisions: readonly ExperienceCapabilityDecision[]
): readonly string[] {
  const errors: string[] = [];
  if (value.digest !== scholarOSUserFlowArchitectureDigest(value)) {
    errors.push("Scholar OS user flow digest is invalid.");
  }
  if (
    value.scholar_identity !== context.scholar_identity ||
    !value.allowed_roles.includes(context.role) ||
    value.steps.length === 0
  ) {
    errors.push("Scholar OS user flow identity or role is invalid.");
  }
  const decisionByCapability = new Map(
    decisions.map((decision) => [decision.capability_id, decision])
  );
  for (const step of value.steps) {
    if (step.digest !== scholarOSUserFlowStepDigest(step)) {
      errors.push(`Scholar OS flow step digest is invalid: ${step.step_id}.`);
    }
    if (
      step.required_permission &&
      !context.permissions.includes(step.required_permission)
    ) {
      errors.push(`Scholar OS flow permission is missing: ${step.step_id}.`);
    }
    if (step.capability_id) {
      const decision = decisionByCapability.get(step.capability_id);
      if (
        !decision ||
        decision.state !== "AVAILABLE" ||
        decision.kernel_decision_reference !== step.kernel_decision_reference
      ) {
        errors.push(`Scholar OS flow capability is unavailable: ${step.step_id}.`);
      }
    }
    if (
      step.mutates_canonical_record &&
      (!step.kernel_decision_reference || !step.human_confirmation_required)
    ) {
      errors.push(`Scholar OS flow mutation bypasses governance: ${step.step_id}.`);
    }
  }
  return errors;
}

export function resolveScholarOSScreenState(
  screen: ScholarOSScreenSpecification,
  context: ExperienceContext,
  decisions: readonly ExperienceCapabilityDecision[]
): "SUCCESS" | "LOADING" | "LOCKED" | "PERMISSION_REQUIRED" | "UNAVAILABLE" {
  if (screen.permissions.some((permission) => !context.permissions.includes(permission))) {
    return "PERMISSION_REQUIRED";
  }
  const relevant = screen.capability_dependencies.map((capabilityId) =>
    decisions.find(({ capability_id }) => capability_id === capabilityId)
  );
  if (
    relevant.some(
      (decision) => !decision || decision.state === "UNAVAILABLE"
    )
  ) {
    return "UNAVAILABLE";
  }
  if (relevant.some((decision) => decision?.state === "REQUIRES_PERMISSION")) {
    return "PERMISSION_REQUIRED";
  }
  if (relevant.some((decision) => decision?.state === "LOCKED")) {
    return "LOCKED";
  }
  if (relevant.some((decision) => decision?.state === "PENDING")) {
    return "LOADING";
  }
  return "SUCCESS";
}

import { describe, expect, it } from "vitest";
import {
  experienceCapabilityDecisionDigest,
} from "../identity";
import type {
  ExperienceCapabilityDecision,
  ExperienceContext,
} from "../types";
import {
  resolveScholarOSScreenState,
  validateScholarOSApplication,
  validateScholarOSScreen,
  validateScholarOSUserFlow,
} from "./composition";
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
  type ScholarOSModuleId,
  type ScholarOSScreenSpecification,
  type ScholarOSUserFlowArchitecture,
} from "./types";

const states = {
  LOADING: "Show stable loading structure.",
  EMPTY: "Show an evidence-safe empty state.",
  FIRST_TIME: "Show first-time setup.",
  SUCCESS: "Show governed content.",
  ERROR: "Show recoverable failure.",
  LOCKED: "Show locked capability.",
  PERMISSION_REQUIRED: "Request permission.",
  UNAVAILABLE: "Do not expose unavailable capability.",
} as const;

function mapping(
  moduleId: ScholarOSModuleId = "HOME",
  availability: ScholarOSCapabilityMapping["availability_state"] = "AVAILABLE"
): ScholarOSCapabilityMapping {
  const body: ScholarOSCapabilityMapping = {
    mapping_id: `MAPPING-${moduleId}`,
    module_id: moduleId,
    capability_id: `CAPABILITY-${moduleId}`,
    engine_dependency: moduleId === "HOME" ? "PBOS-ENGINE-SCHOLAR-RECORD" : null,
    permission_requirement: `scholar.${moduleId.toLowerCase()}.read`,
    availability_state: availability,
    kernel_decision_reference:
      availability === "AVAILABLE" ? `KERNEL-${moduleId}` : null,
    digest: "",
  };
  return { ...body, digest: scholarOSCapabilityMappingDigest(body) };
}

function application(): ScholarOSApplicationArchitecture {
  const modules = SCHOLAR_OS_MODULES.map((moduleId) => {
    const body = {
      module_id: moduleId,
      purpose: `${moduleId} purpose`,
      user_value: `${moduleId} value`,
      experience_domains: ["IDENTITY" as const],
      required_capabilities: [`CAPABILITY-${moduleId}`],
      data_sources: ["SCHOLAR-RECORD"],
      data_owner: "SCHOLAR" as const,
      permissions: [`scholar.${moduleId.toLowerCase()}.read`],
      available_states: Object.keys(states) as (keyof typeof states)[],
      future_engine_integrations: [],
      digest: "",
    };
    return { ...body, digest: scholarOSApplicationModuleDigest(body) };
  });
  const mappings = SCHOLAR_OS_MODULES.map((moduleId) => mapping(moduleId));
  const body: ScholarOSApplicationArchitecture = {
    application_id: "SCHOLAR-OS",
    owner: "PLAYBOOK-EXPERIENCE-ARCHITECTURE",
    modules,
    navigation: [...SCHOLAR_OS_MODULES],
    capability_mappings: mappings,
    permission_boundaries: ["KERNEL-CAPABILITY-AUTHORITY"],
    data_ownership_boundaries: ["SCHOLAR-OWNED"],
    supported_roles: ["SCHOLAR"],
    lifecycle: "IMPLEMENTATION_READY",
    digest: "",
  };
  return { ...body, digest: scholarOSApplicationArchitectureDigest(body) };
}

function screen(): ScholarOSScreenSpecification {
  const body: ScholarOSScreenSpecification = {
    screen_id: "SCHOLAR-HOME",
    module_id: "HOME",
    purpose: "Orient the Scholar.",
    audience: ["SCHOLAR"],
    primary_action: "Review next action",
    secondary_actions: ["Review goals"],
    information_hierarchy: ["Identity", "Goals", "Actions"],
    components: ["ScholarSnapshot", "GoalSummary", "NextActions"],
    data_displayed: ["Scholar Record references"],
    data_owner: "SCHOLAR",
    permissions: ["scholar.home.read"],
    capability_dependencies: ["CAPABILITY-HOME"],
    states,
    digest: "",
  };
  return { ...body, digest: scholarOSScreenSpecificationDigest(body) };
}

function decision(
  state: ExperienceCapabilityDecision["state"] = "AVAILABLE"
): ExperienceCapabilityDecision {
  const body: ExperienceCapabilityDecision = {
    capability_id: "CAPABILITY-HOME",
    state,
    visible: state !== "UNAVAILABLE",
    reason: [],
    kernel_decision_reference: state === "AVAILABLE" ? "KERNEL-HOME" : null,
    digest: "",
  };
  return { ...body, digest: experienceCapabilityDecisionDigest(body) };
}

const context: ExperienceContext = {
  actor_identity: "SCHOLAR-001",
  scholar_identity: "SCHOLAR-001",
  role: "SCHOLAR",
  permissions: ["scholar.home.read", "scholar.record.write"],
  consents: [],
};

describe("Scholar OS product composition", () => {
  it("requires the complete application composition and governed mappings", () => {
    expect(validateScholarOSApplication(application())).toEqual([]);
    const value = application();
    expect(
      validateScholarOSApplication({
        ...value,
        modules: value.modules.slice(1),
      })
    ).toContain("Scholar OS application digest is invalid.");
    expect(
      validateScholarOSApplication({
        ...value,
        capability_mappings: [
          { ...value.capability_mappings[0], kernel_decision_reference: null },
          ...value.capability_mappings.slice(1),
        ],
      })
    ).toContain("Scholar OS application digest is invalid.");
  });

  it("models every screen state and never upgrades capability availability", () => {
    expect(validateScholarOSScreen(screen(), [mapping()])).toEqual([]);
    expect(resolveScholarOSScreenState(screen(), context, [decision()])).toBe(
      "SUCCESS"
    );
    expect(
      resolveScholarOSScreenState(screen(), context, [decision("LOCKED")])
    ).toBe("LOCKED");
    expect(
      resolveScholarOSScreenState(
        screen(),
        { ...context, permissions: [] },
        [decision()]
      )
    ).toBe("PERMISSION_REQUIRED");
    expect(
      resolveScholarOSScreenState(screen(), context, [decision("UNAVAILABLE")])
    ).toBe("UNAVAILABLE");
  });

  it("blocks flows that bypass Kernel decisions or human confirmation", () => {
    const stepBody = {
      step_id: "ACHIEVEMENT-CONFIRM",
      label: "Confirm achievement",
      actor_role: "SCHOLAR" as const,
      required_permission: "scholar.record.write",
      capability_id: "CAPABILITY-HOME",
      kernel_decision_reference: "KERNEL-HOME",
      mutates_canonical_record: true,
      human_confirmation_required: true,
      digest: "",
    };
    const step = { ...stepBody, digest: scholarOSUserFlowStepDigest(stepBody) };
    const body: ScholarOSUserFlowArchitecture = {
      flow_id: "ACHIEVEMENT_CREATION",
      scholar_identity: "SCHOLAR-001",
      purpose: "Create an evidence-backed achievement.",
      entry_state: "DRAFT",
      steps: [step],
      exit_state: "CONFIRMED",
      allowed_roles: ["SCHOLAR"],
      digest: "",
    };
    const flow = { ...body, digest: scholarOSUserFlowArchitectureDigest(body) };
    expect(validateScholarOSUserFlow(flow, context, [decision()])).toEqual([]);
    const bypassStepBody = {
      ...step,
      kernel_decision_reference: null,
      human_confirmation_required: false,
      digest: "",
    };
    const bypassStep = {
      ...bypassStepBody,
      digest: scholarOSUserFlowStepDigest(bypassStepBody),
    };
    const bypassBody = { ...flow, steps: [bypassStep], digest: "" };
    const bypass = {
      ...bypassBody,
      digest: scholarOSUserFlowArchitectureDigest(bypassBody),
    };
    expect(validateScholarOSUserFlow(bypass, context, [decision()])).toContain(
      "Scholar OS flow mutation bypasses governance: ACHIEVEMENT-CONFIRM."
    );
  });
});

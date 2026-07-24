import type { EngineState, GateDefinition, PbosConfig, RuleResult } from "./types";

interface RuleContext {
  config: PbosConfig;
  gates: GateDefinition[];
  state: EngineState;
  eligibleGates: GateDefinition[];
  blockedGates: Array<{ gate: GateDefinition; missingDependencies: string[] }>;
}

type Rule = (context: RuleContext) => RuleResult;

const noSkippedDependencies: Rule = ({ blockedGates }) => ({
  id: "NoSkippedDependencies",
  severity: blockedGates.length > 0 ? "warning" : "info",
  passed: true,
  message: blockedGates.length > 0 ? `${blockedGates.length} gate(s) are blocked by incomplete dependencies and will not be selected.` : "No blocked dependency chains were selected.",
  remediation: "Complete prerequisite gates before selecting dependent gates.",
  handbookReference: "docs/auto_sprint.md#sprint-selection-algorithm",
});

const singleSprintRule: Rule = ({ eligibleGates }) => ({
  id: "SingleSprintRule",
  severity: "info",
  passed: eligibleGates.length >= 1,
  message: eligibleGates.length >= 1 ? "Planner will select exactly one eligible gate." : "No eligible gates are available for selection.",
  remediation: "If no eligible gate exists, unblock dependencies or add a valid gate definition.",
  handbookReference: "docs/auto_sprint.md#required-output-format",
});

const documentationRule: Rule = ({ config }) => {
  const hasAuthority = Boolean(config.handbook.implementationTruth && config.handbook.releasePolicy && config.handbook.sprintSequencing);
  return {
    id: "DocumentationRule",
    severity: hasAuthority ? "info" : "error",
    passed: hasAuthority,
    message: hasAuthority ? "Handbook authority paths are configured." : "One or more handbook authority paths are missing from PBOS config.",
    remediation: "Configure MASTER_CHECKLIST, RELEASE_PROCESS, and auto_sprint paths in pbos.config.json.",
    handbookReference: "docs/MASTER_CHECKLIST.md#purpose",
  };
};

const validationRule: Rule = ({ gates }) => {
  const invalid = gates.filter((gate) => gate.validation.length === 0);
  return {
    id: "ValidationRule",
    severity: invalid.length > 0 ? "error" : "info",
    passed: invalid.length === 0,
    message: invalid.length === 0 ? "Every gate declares validation requirements." : `Gates without validation: ${invalid.map((gate) => gate.id).join(", ")}`,
    remediation: "Add at least one validation requirement to every gate definition.",
    handbookReference: "docs/RELEASE_PROCESS.md#testing",
  };
};

const releaseRule: Rule = ({ state }) => ({
  id: "ReleaseRule",
  severity: "info",
  passed: state.executionMode === "planning",
  message: "PBOS Engine v3 remains in planning mode and will not authorize application changes.",
  remediation: "Add execution-mode release safeguards in PBOS-ENGINE-004 before modifying application code.",
  handbookReference: "docs/RELEASE_PROCESS.md#deployment",
});

export class RuleEngine {
  private readonly rules: Rule[] = [noSkippedDependencies, singleSprintRule, documentationRule, validationRule, releaseRule];

  evaluate(context: RuleContext): RuleResult[] {
    return this.rules.map((rule) => rule(context));
  }
}

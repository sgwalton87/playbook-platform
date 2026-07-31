export type OperatorCapabilityStatus =
  | "OPERATIONAL"
  | "STRUCTURAL"
  | "STUB"
  | "MISSING";

export interface OperatorCapability {
  readonly capability: string;
  readonly status: OperatorCapabilityStatus;
  readonly owner: string;
  readonly evidence: string;
  readonly blocker: string | null;
}

export const OPERATOR_CAPABILITIES: readonly OperatorCapability[] = [
  {
    capability: "Repository and trusted context",
    status: "OPERATIONAL",
    owner: "Repository Context and Context Activation Authorities",
    evidence: "Canonical loaders, validators, refresh, activation, and tests exist.",
    blocker: null,
  },
  {
    capability: "Constitutional milestone selection",
    status: "OPERATIONAL",
    owner: "Constitutional Planner",
    evidence: "Kernel repository input consumes gates and the master build manifest.",
    blocker: null,
  },
  {
    capability: "Execution package generation",
    status: "OPERATIONAL",
    owner: "Development Orchestration",
    evidence: "A certified kernel plan deterministically produces a Codex execution package.",
    blocker: null,
  },
  {
    capability: "Execution approval command",
    status: "OPERATIONAL",
    owner: "Human Mission Authority",
    evidence: "The approve command persists package-bound approval, authority, and authorization history.",
    blocker: null,
  },
  {
    capability: "Execution authority handoff",
    status: "OPERATIONAL",
    owner: "Execution Authority",
    evidence: "Typed builder, validator, and durable store exist.",
    blocker: null,
  },
  {
    capability: "Agent registration",
    status: "OPERATIONAL",
    owner: "Agent Registry",
    evidence: "Static registered agent descriptions and permissions exist.",
    blocker: null,
  },
  {
    capability: "Task assignment",
    status: "OPERATIONAL",
    owner: "Execution Admission",
    evidence: "The assign command resolves certified provider identity and persists admitted assignments.",
    blocker: null,
  },
  {
    capability: "Execution fabric and provider adapter",
    status: "OPERATIONAL",
    owner: "Execution Fabric and Provider Registry",
    evidence: "Provider-neutral registry, authorization, runner, Codex adapter, and evidence contracts exist.",
    blocker: null,
  },
  {
    capability: "Execution completion and milestone advancement",
    status: "OPERATIONAL",
    owner: "Lifecycle and Certification Authorities",
    evidence: "Evidence-gated advancement persists append-only lifecycle truth consumed by the kernel.",
    blocker: null,
  },
] as const;

export function operatorPipelineReady(
  capabilities: readonly OperatorCapability[] = OPERATOR_CAPABILITIES
): boolean {
  return capabilities.every(({ status }) => status === "OPERATIONAL");
}

import { artifactDigest } from "../identity";
import type {
  Certification,
  CertificationEngine,
  Decision,
  DecisionEngine,
  EligibilityEngine,
  EligibilityResult,
  ExecutionPlan,
  KernelInput,
  KernelObjective,
  PriorityEngine,
  PriorityResult,
  PriorityWeights,
  GraphValidation,
} from "./types";

export class DeterministicEligibilityEngine implements EligibilityEngine {
  evaluate(
    objectives: KernelObjective[],
    graph: GraphValidation,
    context = {
      repositoryValid: true,
      runtimeValid: true,
      constitutionValid: true,
      registryValid: true,
    }
  ): EligibilityResult[] {
    const states = new Map(objectives.map((item) => [item.id, item.state]));
    return [...objectives]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((objective) => {
        const reasons: string[] = [];
        if (!context.repositoryValid) reasons.push("REPOSITORY_CONTEXT_INVALID");
        if (!context.runtimeValid) reasons.push("RUNTIME_CONTEXT_INVALID");
        if (!context.constitutionValid) reasons.push("CONSTITUTION_INVALID");
        if (!context.registryValid) reasons.push("OBJECTIVE_REGISTRY_INVALID");
        if (!graph.valid) reasons.push("DEPENDENCY_GRAPH_INVALID");
        if (objective.state !== "READY") reasons.push(`STATE_${objective.state}_NOT_ELIGIBLE`);
        if (!objective.authority) reasons.push("AUTHORITY_MISSING");
        if (objective.blockers.length) reasons.push(...objective.blockers.map((item) => `BLOCKER:${item}`));
        for (const dependency of objective.dependencyIds) {
          if (states.get(dependency) !== "COMPLETED") reasons.push(`DEPENDENCY_INCOMPLETE:${dependency}`);
        }
        for (const approval of objective.requiredApprovals) {
          if (!objective.approvals.includes(approval)) reasons.push(`APPROVAL_MISSING:${approval}`);
        }
        if (!objective.validations.length) reasons.push("VALIDATION_CONTRACT_MISSING");
        return { objectiveId: objective.id, eligible: reasons.length === 0, reasons };
      });
  }
}

export class DeterministicPriorityEngine implements PriorityEngine {
  score(objectives: KernelObjective[], weights: PriorityWeights): PriorityResult[] {
    const total =
      weights.constitutional +
      weights.strategic +
      weights.engineering +
      weights.business +
      weights.operational;
    if (total !== 100) throw new Error(`Priority weights must total 100; received ${total}.`);
    return objectives.map((objective) => {
      const score =
        (
          objective.priority.constitutional * weights.constitutional +
          objective.priority.strategic * weights.strategic +
          objective.priority.engineering * weights.engineering +
          objective.priority.business * weights.business +
          objective.priority.operational * weights.operational
        ) / 100;
      return { objectiveId: objective.id, score, dimensions: objective.priority };
    });
  }
}

export class DeterministicDecisionEngine implements DecisionEngine {
  decide(args: {
    objectives: KernelObjective[];
    eligibility: EligibilityResult[];
    priorities: PriorityResult[];
  }): Decision {
    const eligibleIds = new Set(args.eligibility.filter((item) => item.eligible).map((item) => item.objectiveId));
    const scores = new Map(args.priorities.map((item) => [item.objectiveId, item.score]));
    const eligible = args.objectives
      .filter((item) => eligibleIds.has(item.id))
      .sort(
        (a, b) =>
          a.constitutionalOrder - b.constitutionalOrder ||
          (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) ||
          a.risk - b.risk ||
          Number(b.criticalPath) - Number(a.criticalPath) ||
          a.estimatedEffort - b.estimatedEffort ||
          a.id.localeCompare(b.id)
      );
    const selected = eligible[0] ?? null;
    const body = {
      selectedObjectiveId: selected?.id ?? null,
      eligibleObjectiveIds: eligible.map((item) => item.id),
      blockedObjectiveIds: args.objectives.map((item) => item.id).filter((id) => !eligibleIds.has(id)).sort(),
      rationale: selected
        ? [`Selected ${selected.id} by constitutional order, weighted priority, risk, critical path, effort, then identifier.`]
        : ["No objective satisfied every eligibility requirement."],
    };
    return { ...body, digest: artifactDigest(body) };
  }
}

export function createExecutionPlan(input: KernelInput, decision: Decision): ExecutionPlan | null {
  const objective = input.registry.objectives.find((item) => item.id === decision.selectedObjectiveId);
  if (!objective) return null;
  const body = {
    id: `PLAN-${artifactDigest({ registry: input.registry.digest, objective: objective.id, decision: decision.digest }).slice(0, 16)}`,
    objectiveId: objective.id,
    authority: objective.authority,
    dependencies: [...objective.dependencyIds].sort(),
    validations: [...objective.validations].sort(),
    artifacts: [...objective.artifacts].sort((a, b) => a.id.localeCompare(b.id)),
    approvals: [...objective.approvals].sort(),
    outputs: [...objective.outputs].sort(),
    certification: ["Independent decision replay", "Plan identity validation", "Evidence digest validation"],
    rollback: [...objective.rollback],
    risk: objective.risk,
    effort: objective.estimatedEffort,
    successCriteria: [...objective.successCriteria],
    failureCriteria: [...objective.failureCriteria],
  };
  return { ...body, digest: artifactDigest(body) };
}

export class IndependentCertificationEngine implements CertificationEngine {
  certify(input: KernelInput, graph: GraphValidation, decision: Decision, plan: ExecutionPlan | null): Certification {
    const findings: string[] = [];
    if (!input.repository.valid) findings.push(...input.repository.errors.map((item) => `REPOSITORY:${item}`));
    if (!input.runtime.valid) findings.push(...input.runtime.errors.map((item) => `RUNTIME:${item}`));
    if (!input.constitution.id || !input.constitution.digest) findings.push("CONSTITUTION_IDENTITY_INVALID");
    if (!input.registry.id || !input.registry.digest) findings.push("REGISTRY_IDENTITY_INVALID");
    const expectedRegistryDigest = artifactDigest({
      id: input.registry.id,
      rootObjectiveIds: input.registry.rootObjectiveIds,
      objectives: input.registry.objectives,
    });
    if (input.registry.digest !== expectedRegistryDigest) findings.push("REGISTRY_DIGEST_MISMATCH");
    if (!graph.valid) findings.push(...graph.findings.map((item) => `GRAPH:${item.code}:${item.objectiveId ?? ""}`));
    if (decision.selectedObjectiveId && !plan) findings.push("SELECTED_OBJECTIVE_HAS_NO_PLAN");
    if (plan && plan.objectiveId !== decision.selectedObjectiveId) findings.push("PLAN_OBJECTIVE_MISMATCH");
    if (plan?.artifacts.some((artifact) => !artifact.id || !artifact.uri || !artifact.digest)) {
      findings.push("PLAN_EVIDENCE_IDENTITY_INVALID");
    }
    const replayEligibility = new DeterministicEligibilityEngine().evaluate(
      input.registry.objectives,
      graph,
      {
        repositoryValid: input.repository.valid,
        runtimeValid: input.runtime.valid,
        constitutionValid: Boolean(input.constitution.id && input.constitution.digest),
        registryValid:
          Boolean(input.registry.id && input.registry.digest) &&
          input.registry.digest === expectedRegistryDigest,
      }
    );
    let replayPriorities: PriorityResult[] = [];
    try {
      replayPriorities = new DeterministicPriorityEngine().score(
        input.registry.objectives,
        input.priorityWeights
      );
    } catch (error: unknown) {
      findings.push(error instanceof Error ? error.message : String(error));
    }
    if (replayPriorities.length) {
      const replay = new DeterministicDecisionEngine().decide({
        objectives: input.registry.objectives,
        eligibility: replayEligibility,
        priorities: replayPriorities,
      });
      if (replay.digest !== decision.digest) findings.push("DECISION_REPLAY_MISMATCH");
    }
    const body = {
      status: findings.length === 0 ? "CERTIFIED" as const : "REJECTED" as const,
      validator: "pbos.kernel.independent-certifier.v1",
      decisionDigest: decision.digest,
      planDigest: plan?.digest ?? null,
      findings,
      evidence: [input.constitution.digest, input.registry.digest, input.repository.contentDigest].sort(),
    };
    return { ...body, digest: artifactDigest(body) };
  }
}

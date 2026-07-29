import { artifactDigest, canonicalJson } from "../identity";
import { DependencyGraph } from "./dependency-graph";
import {
  createExecutionPlan,
  DeterministicDecisionEngine,
  DeterministicEligibilityEngine,
  DeterministicPriorityEngine,
  IndependentCertificationEngine,
} from "./engines";
import {
  KERNEL_STAGES,
  type Certification,
  type Decision,
  type ExecutionKernel,
  type ExecutionPlan,
  type KernelEvent,
  type KernelInput,
  type KernelResult,
  type KernelStage,
  type StateCoordinator,
  type StateTransitionRequest,
} from "./types";

export class GovernedStateCoordinator implements StateCoordinator {
  request(
    input: KernelInput,
    decision: Decision,
    certification: Certification
  ): StateTransitionRequest | null {
    const objective = input.registry.objectives.find(
      (item) => item.id === decision.selectedObjectiveId
    );
    if (!objective || certification.status !== "CERTIFIED") return null;
    const body = {
      objectiveId: objective.id,
      from: objective.state,
      to: "PLANNED" as const,
      authority: objective.authority,
      decisionDigest: decision.digest,
      certificationDigest: certification.digest,
      requestedAt: input.observedAt,
    };
    return {
      id: `TRANSITION-${artifactDigest(body).slice(0, 16)}`,
      ...body,
    };
  }
}

export class ConstitutionalExecutionKernel implements ExecutionKernel {
  readonly version = "1.0.0" as const;

  plan(input: KernelInput): KernelResult {
    const inputDigest = artifactDigest(input);
    const correlationId = `CORR-${inputDigest.slice(0, 16)}`;
    const executionId = `EXEC-${artifactDigest({
      inputDigest,
      engine: input.runtime.engineVersion,
    }).slice(0, 16)}`;
    const graph = new DependencyGraph().validate(
      input.registry.objectives,
      input.registry.rootObjectiveIds
    );
    const eligibility = new DeterministicEligibilityEngine().evaluate(
      input.registry.objectives,
      graph,
      {
        repositoryValid: input.repository.valid,
        runtimeValid: input.runtime.valid,
        constitutionValid: Boolean(input.constitution.id && input.constitution.digest),
        registryValid:
          Boolean(input.registry.id && input.registry.digest) &&
          input.registry.digest === artifactDigest({
            id: input.registry.id,
            rootObjectiveIds: input.registry.rootObjectiveIds,
            objectives: input.registry.objectives,
          }),
      }
    );
    const priorities = new DeterministicPriorityEngine().score(
      input.registry.objectives,
      input.priorityWeights
    );
    const decision = new DeterministicDecisionEngine().decide({
      objectives: input.registry.objectives,
      eligibility,
      priorities,
    });
    const executionPlan = createExecutionPlan(input, decision);
    const certification = new IndependentCertificationEngine().certify(
      input,
      graph,
      decision,
      executionPlan
    );
    const transition = new GovernedStateCoordinator().request(
      input,
      decision,
      certification
    );

    const stageOutputs: Record<KernelStage, unknown> = {
      REPOSITORY_CONTEXT: input.repository,
      REPOSITORY_VALIDATION: {
        valid: input.repository.valid,
        errors: input.repository.errors,
      },
      CONSTITUTION_VALIDATION: input.constitution,
      OBJECTIVE_REGISTRY: {
        id: input.registry.id,
        digest: input.registry.digest,
        count: input.registry.objectives.length,
      },
      OBJECTIVE_STATE: input.registry.objectives.map(({ id, state }) => ({
        id,
        state,
      })),
      DEPENDENCY_GRAPH: graph,
      ELIGIBILITY: eligibility,
      PRIORITY: priorities,
      RISK: input.registry.objectives.map(({ id, risk }) => ({ id, risk })),
      DECISION: decision,
      EXECUTION_PLAN: executionPlan,
      CERTIFICATION: certification,
      REPORTING: {
        decisionDigest: decision.digest,
        certificationDigest: certification.digest,
      },
      STATE_TRANSITION: transition,
    };
    const objectiveId = decision.selectedObjectiveId;
    let pipelineHealthy = true;
    const events: KernelEvent[] = KERNEL_STAGES.map((stage) => {
      pipelineHealthy =
        pipelineHealthy &&
        this.stagePassed(stage, input, graph.valid, certification);
      return {
        timestamp: input.observedAt,
        correlationId,
        executionId,
        objectiveId,
        stage,
        inputDigest,
        outputDigest: artifactDigest(stageOutputs[stage]),
        validator: `pbos.kernel.${stage.toLowerCase()}.v1`,
        durationMs: 0,
        status: pipelineHealthy ? "PASS" : "FAIL",
        evidence: [
          input.constitution.digest,
          input.registry.digest,
          input.repository.contentDigest,
        ].sort(),
      };
    });

    const reportBody = {
      version: "1.0.0" as const,
      correlationId,
      executionId,
      status:
        certification.status === "CERTIFIED" ? "CERTIFIED" as const : "BLOCKED" as const,
      decision,
      plan: executionPlan,
      certification,
      transition,
      events,
    };
    const json = canonicalJson(reportBody, 2);
    const markdown = this.markdown(reportBody);
    return {
      ...reportBody,
      report: { json, markdown, digest: artifactDigest({ json, markdown }) },
    };
  }

  private stagePassed(
    stage: KernelStage,
    input: KernelInput,
    graphValid: boolean,
    certification: Certification
  ): boolean {
    if (stage === "REPOSITORY_VALIDATION") return input.repository.valid;
    if (stage === "CONSTITUTION_VALIDATION") return Boolean(input.constitution.id && input.constitution.digest);
    if (stage === "OBJECTIVE_REGISTRY") return Boolean(input.registry.id && input.registry.digest);
    if (stage === "DEPENDENCY_GRAPH") return graphValid;
    if (stage === "CERTIFICATION") return certification.status === "CERTIFIED";
    if (stage === "STATE_TRANSITION") {
      return certification.status === "CERTIFIED";
    }
    return true;
  }

  private markdown(value: {
    executionId: string;
    status: string;
    decision: Decision;
    plan: ExecutionPlan | null;
    certification: Certification;
  }): string {
    return [
      "# PBOS Constitutional Execution Report",
      "",
      `- Execution: ${value.executionId}`,
      `- Status: ${value.status}`,
      `- Selected Objective: ${value.decision.selectedObjectiveId ?? "NONE"}`,
      `- Decision Digest: ${value.decision.digest}`,
      `- Plan: ${value.plan?.id ?? "NONE"}`,
      `- Certification: ${value.certification.status}`,
      `- Certification Digest: ${value.certification.digest}`,
      "",
      "## Rationale",
      "",
      ...value.decision.rationale.map((item) => `- ${item}`),
      "",
    ].join("\n");
  }
}

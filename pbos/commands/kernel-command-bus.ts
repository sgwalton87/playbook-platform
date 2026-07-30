import { runRepositoryKernel } from "../engine/kernel-repository-adapter";
import { formatEngineHealth, getEngineHealth } from "../health/engine-health";
import { runKernelRuntime } from "../runtime/kernel-runtime";
import { runDevelopmentOrchestration } from "../orchestration";

export const KERNEL_COMMANDS = [
  "next",
  "plan",
  "report",
  "certify",
  "status",
  "execute",
  "analyze",
  "recommend",
  "refresh",
  "package",
  "authorize",
  "improve",
] as const;

export type KernelCommandName = (typeof KERNEL_COMMANDS)[number];

export interface KernelCommandResult {
  readonly command: KernelCommandName;
  readonly output: string;
  readonly successful: boolean;
}

export function isKernelCommand(value: string): value is KernelCommandName {
  return KERNEL_COMMANDS.some((command) => command === value);
}

export async function dispatchKernelCommand(
  command: KernelCommandName,
  rootDir = process.cwd(),
  actorId = process.env.PBOS_ACTOR_ID ?? ""
): Promise<KernelCommandResult> {
  if (command === "execute") {
    const result = await runKernelRuntime({ rootDir, actorId });
    return {
      command,
      successful: result.successful,
      output: JSON.stringify(result.envelope, null, 2),
    };
  }

  if (command === "analyze") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    return {
      command,
      successful: true,
      output: `PBOS SYSTEM ASSESSMENT\n${JSON.stringify(
        {
          intelligence: orchestration.intelligence,
          eligibility: orchestration.eligibility,
          recommendation: orchestration.governedRecommendation,
        },
        null,
        2
      )}`,
    };
  }

  if (command === "recommend") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    return {
      command,
      successful: true,
      output: `PBOS GOVERNED PLAN RECOMMENDATION\n${JSON.stringify(
        orchestration.governedRecommendation,
        null,
        2
      )}`,
    };
  }

  if (command === "refresh") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    return {
      command,
      successful: true,
      output: [
        "PBOS CONTEXT REFRESH GOVERNANCE",
        `Context Trust: ${orchestration.input.repository.valid ? "TRUSTED" : "REVIEW_REQUIRED"}`,
        "Mutation: NOT PERFORMED",
        "An approved reconciliation-bound refresh request is required.",
      ].join("\n"),
    };
  }

  if (command === "package") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    return {
      command,
      successful: true,
      output: orchestration.executionPackage
        ? `PBOS CODEX EXECUTION PACKAGE\n${JSON.stringify(orchestration.executionPackage, null, 2)}`
        : `PBOS CODEX EXECUTION PACKAGE\nBLOCKED\n${JSON.stringify(orchestration.governedRecommendation, null, 2)}`,
    };
  }

  if (command === "authorize") {
    return {
      command,
      successful: true,
      output: [
        "PBOS HUMAN AUTHORIZATION GATEWAY",
        "Decision: PENDING",
        "No authorization decision was created.",
        "Approval requires an identity-bound request, immutable package digest, evidence, and independent approver where required.",
      ].join("\n"),
    };
  }

  if (command === "improve") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    return {
      command,
      successful: true,
      output: `PBOS CONTINUOUS IMPROVEMENT ASSESSMENT\n${JSON.stringify(
        {
          findings: orchestration.intelligence.assessment.risks,
          evidence: orchestration.intelligence.assessment.evidence,
          mutation: "NOT_PERFORMED",
        },
        null,
        2
      )}`,
    };
  }

  if (command === "plan") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    return {
      command,
      successful: orchestration.executionPackage !== null,
      output: orchestration.executionPackage
        ? JSON.stringify(orchestration.executionPackage, null, 2)
        : [
            "No Codex execution package is eligible.",
            JSON.stringify(orchestration.recommendation, null, 2),
          ].join("\n"),
    };
  }

  const kernel = await runRepositoryKernel(rootDir);

  if (command === "status") {
    const health = await getEngineHealth(rootDir);
    return {
      command,
      successful: true,
      output: [
        formatEngineHealth(health),
        `Kernel Decision: ${kernel.decision.selectedObjectiveId ?? "NONE"}`,
        `Kernel Certification: ${kernel.certification.status}`,
        `Kernel Report Digest: ${kernel.report.digest}`,
        `Development Recommendation: ${kernel.decision.selectedObjectiveId ?? "NONE"}`,
        `Development Orchestration: ${kernel.certification.status === "CERTIFIED" ? "READY" : "BLOCKED"}`,
        `Context Trust: ${kernel.certification.status === "CERTIFIED" ? "VERIFIED" : "INVALID"}`,
        `System Maturity: ${kernel.certification.status === "CERTIFIED" ? "OPERATIONAL" : "BLOCKED"}`,
        `Planning Readiness: ${kernel.decision.selectedObjectiveId ? "READY" : "BLOCKED"}`,
      ].join("\n"),
    };
  }

  if (command === "next" || command === "report") {
    return {
      command,
      successful: kernel.status === "CERTIFIED",
      output: kernel.report.markdown,
    };
  }

  if (command === "certify") {
    return {
      command,
      successful: kernel.certification.status === "CERTIFIED",
      output: JSON.stringify(kernel.certification, null, 2),
    };
  }

  throw new Error(`Unhandled PBOS kernel command '${command}'.`);
}

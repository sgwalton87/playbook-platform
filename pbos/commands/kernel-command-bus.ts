import { runRepositoryKernel } from "../engine/kernel-repository-adapter";
import { formatEngineHealth, getEngineHealth } from "../health/engine-health";
import { runKernelRuntime } from "../runtime/kernel-runtime";
import { runDevelopmentOrchestration } from "../orchestration";
import { runAutonomousBuildCycle } from "../orchestration/autonomous";
import { loadMasterBuildManifest } from "../manifests";
import { loadKernelRuntimeHistory } from "../runtime/kernel-runtime";
import { createDefaultAgentRegistry } from "../agents/registry";
import {
  assessAutonomousReadiness,
  createAuthorityLinkedActivationEvidence,
  discoverTrustedContext,
  loadTrustedBuildContext,
  persistTrustedContext,
} from "../context/activation";
import {
  createChangeBoundary,
  createChangeInventory,
  assessChangeBoundary,
  loadChangeBoundary,
  persistChangeBoundary,
} from "../context/change-boundary";
import {
  createLaunchApproval,
  persistLaunchApproval,
} from "../authority/launch";
import {
  evidenceList,
  evidenceString,
  type FounderEvidenceInput,
} from "./founder-evidence-input";

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
  "manifest",
  "cycle",
  "approve",
  "advance",
  "history",
  "agents",
  "assign",
  "first-build",
  "execution-status",
  "context-status",
  "context-reconcile",
  "context-activate",
  "change-inventory",
  "change-boundary",
  "approve-boundary",
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
  actorId = process.env.PBOS_ACTOR_ID ?? "",
  evidenceInput: FounderEvidenceInput = {}
): Promise<KernelCommandResult> {
  if (command === "change-inventory") {
    const inventory = createChangeInventory(rootDir);
    return {
      command,
      successful: inventory.changes.every(({ owner }) => owner !== "UNKNOWN"),
      output: `PBOS CHANGE INVENTORY\n${JSON.stringify(inventory, null, 2)}`,
    };
  }

  if (command === "change-boundary") {
    const timestamp = new Date().toISOString();
    const requesterIdentity = evidenceString(
      evidenceInput, "requester-identity", process.env.PBOS_BOUNDARY_REQUESTER_ID
    );
    const approvedFiles = evidenceList(
      evidenceInput, "approved-files", process.env.PBOS_BOUNDARY_APPROVED_FILES ?? ""
    );
    const excludedFiles = evidenceList(
      evidenceInput, "excluded-files", process.env.PBOS_BOUNDARY_EXCLUDED_FILES ?? ""
    );
    const businessPurpose = evidenceString(
      evidenceInput, "business-purpose", process.env.PBOS_BOUNDARY_BUSINESS_PURPOSE
    );
    const technicalPurpose = evidenceString(
      evidenceInput, "technical-purpose", process.env.PBOS_BOUNDARY_TECHNICAL_PURPOSE
    );
    const purpose = evidenceString(
      evidenceInput, "purpose", process.env.PBOS_BOUNDARY_PURPOSE ?? businessPurpose
    );
    const riskAcknowledgment = evidenceString(
      evidenceInput, "risk-acknowledgment",
      process.env.PBOS_BOUNDARY_RISK_ACKNOWLEDGMENT
    );
    const expirationTimestamp = evidenceString(
      evidenceInput, "expiration", process.env.PBOS_BOUNDARY_EXPIRATION
    );
    const previewInventory = createChangeInventory(rootDir, timestamp);
    const boundaryTypeInput = evidenceString(
      evidenceInput, "boundary-type", process.env.PBOS_BOUNDARY_TYPE
    ).toUpperCase();
    const boundaryType = boundaryTypeInput ||
      (previewInventory.changes.length > 0 ? "CHANGE" : "");
    const previewAssessment = assessChangeBoundary(
      previewInventory,
      loadChangeBoundary(rootDir)?.latest ?? null,
      new Date().toISOString()
    );
    if (
      !requesterIdentity ||
      !purpose ||
      !businessPurpose ||
      !technicalPurpose ||
      !riskAcknowledgment ||
      !expirationTimestamp ||
      !["CHANGE", "BASELINE_ACTIVATION"].includes(boundaryType)
    ) {
      return {
        command,
        successful: false,
        output: [
          "PBOS CHANGE BOUNDARY",
          "Decision: BLOCKED",
          `Current Branch: ${previewAssessment.branch_identity}`,
          `Current Commit: ${previewAssessment.commit_identity}`,
          `Changed Files: ${previewAssessment.change_summary.length}`,
          `Risk Level: ${previewAssessment.risk_level}`,
          `Boundary Type: ${boundaryType || "REQUIRED"}`,
          `Recommended Scope: ${previewAssessment.classification_summary.REVIEW_REQUIRED} files require explicit review.`,
          "Boundary type, requester identity, business and technical purposes, complete file classification, risk acknowledgment, and expiration are required.",
          "No runtime artifact was created.",
        ].join("\n"),
      };
    }
    try {
      const inventory = createChangeInventory(rootDir, timestamp);
      const baselineIdentity = boundaryType === "BASELINE_ACTIVATION"
        ? discoverTrustedContext(rootDir, timestamp).baseline_identity
        : undefined;
      const declaration = createChangeBoundary({
        inventory,
        boundaryType: boundaryType as "CHANGE" | "BASELINE_ACTIVATION",
        baselineIdentity,
        requesterIdentity,
        approvedFiles,
        excludedFiles,
        purpose,
        businessPurpose,
        technicalPurpose,
        riskAcknowledgment,
        creationTimestamp: timestamp,
        expirationTimestamp,
      });
      const artifact = persistChangeBoundary(rootDir, declaration);
      return {
        command,
        successful: true,
        output: `PBOS CHANGE BOUNDARY\n${JSON.stringify({ declaration, artifact }, null, 2)}`,
      };
    } catch (error: unknown) {
      return {
        command,
        successful: false,
        output: [
          "PBOS CHANGE BOUNDARY",
          "Decision: BLOCKED",
          error instanceof Error ? error.message : String(error),
          "No runtime artifact was created.",
        ].join("\n"),
      };
    }
  }

  if (command === "approve-boundary") {
    const boundary = loadChangeBoundary(rootDir)?.latest ?? null;
    const requesterIdentity = evidenceString(
      evidenceInput, "requester-identity", process.env.PBOS_LAUNCH_REQUESTER_ID
    );
    const reviewerIdentity = evidenceString(
      evidenceInput, "reviewer-identity", process.env.PBOS_LAUNCH_REVIEWER_ID
    );
    const decision = evidenceString(
      evidenceInput, "decision", process.env.PBOS_LAUNCH_DECISION
    ).toUpperCase();
    const reason = evidenceString(
      evidenceInput, "reason", process.env.PBOS_LAUNCH_REASON
    );
    const riskAcknowledgment = evidenceString(
      evidenceInput, "risk-acknowledgment",
      process.env.PBOS_LAUNCH_RISK_ACKNOWLEDGMENT
    );
    const expiration = evidenceString(
      evidenceInput, "expiration", process.env.PBOS_LAUNCH_EXPIRATION
    );
    if (
      !boundary ||
      !requesterIdentity ||
      !reviewerIdentity ||
      !["APPROVED", "REJECTED", "EXPIRED", "REVOKED"].includes(decision ?? "") ||
      !reason ||
      !riskAcknowledgment ||
      !expiration
    ) {
      return {
        command,
        successful: false,
        output: [
          "PBOS HUMAN LAUNCH AUTHORITY",
          "Decision: BLOCKED",
          "A current change boundary, requester, independent reviewer, APPROVED/REJECTED/EXPIRED/REVOKED decision, reason, risk acknowledgment, and expiration are required.",
          "No runtime artifact was created.",
        ].join("\n"),
      };
    }
    const timestamp = new Date().toISOString();
    try {
      const approval = createLaunchApproval({
        boundary,
        requesterIdentity,
        reviewerIdentity,
        decision: decision as "APPROVED" | "REJECTED" | "EXPIRED" | "REVOKED",
        reason,
        riskAcknowledgment,
        timestamp,
        expiration,
      });
      const artifact = persistLaunchApproval(rootDir, approval);
      return {
        command,
        successful: true,
        output: `PBOS HUMAN LAUNCH AUTHORITY\n${JSON.stringify({ approval, artifact }, null, 2)}`,
      };
    } catch (error: unknown) {
      return {
        command,
        successful: false,
        output: [
          "PBOS HUMAN LAUNCH AUTHORITY",
          "Decision: BLOCKED",
          error instanceof Error ? error.message : String(error),
          "No runtime artifact was created.",
        ].join("\n"),
      };
    }
  }

  if (command === "context-reconcile") {
    const discovery = discoverTrustedContext(rootDir);
    return {
      command,
      successful: discovery.reconciliation.state === "VERIFIED",
      output: `PBOS CONTEXT IDENTITY RECONCILIATION\n${JSON.stringify(discovery, null, 2)}`,
    };
  }

  if (command === "context-status") {
    const discovery = discoverTrustedContext(rootDir);
    const history = loadTrustedBuildContext(rootDir);
    const readiness = assessAutonomousReadiness({
      context: history?.latest ?? null,
      repository: discovery.assessment,
      timestamp: new Date().toISOString(),
    });
    return {
      command,
      successful: readiness.current_capability_level === "GOVERNED_PLANNING",
      output: [
        "PBOS TRUSTED BUILD CONTEXT",
        `Current Context: ${history?.latest.context_id ?? "NONE"}`,
        `Trust Level: ${readiness.current_capability_level === "GOVERNED_PLANNING" ? "TRUSTED" : "BLOCKED"}`,
        `Identity: ${history?.latest.repository_identity ?? discovery.assessment.repository_identity}`,
        `Expiration: ${history?.latest.expiration_timestamp ?? "NONE"}`,
        `Validation: ${readiness.current_capability_level === "GOVERNED_PLANNING" ? "PASS" : "FAIL"}`,
        JSON.stringify(readiness, null, 2),
      ].join("\n"),
    };
  }

  if (command === "context-activate") {
    const timestamp = new Date().toISOString();
    const resolution = createAuthorityLinkedActivationEvidence(
      rootDir,
      timestamp
    );
    if (!resolution.evidence || !resolution.valid) {
      return {
        command,
        successful: false,
        output: [
          "PBOS TRUSTED BUILD CONTEXT ACTIVATION",
          "Decision: BLOCKED",
          ...resolution.findings,
          "No runtime artifact was created.",
        ].join("\n"),
      };
    }
    const evidence = resolution.evidence;
    const artifact = persistTrustedContext(rootDir, evidence);
    return {
      command,
      successful: true,
      output: `PBOS TRUSTED BUILD CONTEXT ACTIVATION\n${JSON.stringify({ evidence, artifact }, null, 2)}`,
    };
  }
  if (command === "execute") {
    const result = await runKernelRuntime({ rootDir, actorId });
    return {
      command,
      successful: result.successful,
      output: JSON.stringify(result.envelope, null, 2),
    };
  }

  if (command === "manifest") {
    const manifest = loadMasterBuildManifest(rootDir);
    return {
      command,
      successful: true,
      output: `PBOS PLAYBOOK MASTER MANIFEST\n${JSON.stringify(
        { ...manifest.manifest, digest: manifest.digest },
        null,
        2
      )}`,
    };
  }

  if (command === "agents") {
    const registry = createDefaultAgentRegistry("2026-07-30T00:00:00.000Z").snapshot();
    return {
      command,
      successful: true,
      output: `PBOS EXECUTION AGENT REGISTRY\n${JSON.stringify(registry, null, 2)}`,
    };
  }

  if (command === "assign") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    const findings = [
      ...(!orchestration.input.repository.valid ? ["Trusted context is unavailable."] : []),
      ...(!orchestration.executionPackage ? ["Approved execution package is unavailable."] : []),
      "Approved authority record is unavailable.",
    ];
    return {
      command,
      successful: false,
      output: [
        "PBOS EXECUTION TASK ASSIGNMENT",
        "Decision: BLOCKED",
        ...findings,
        "No agent assignment was created.",
      ].join("\n"),
    };
  }

  if (command === "first-build") {
    const cycle = await runAutonomousBuildCycle(rootDir);
    return {
      command,
      successful: false,
      output: [
        "PBOS FIRST GOVERNED PRODUCT BUILD",
        JSON.stringify(cycle, null, 2),
        "No agent executed product work.",
      ].join("\n"),
    };
  }

  if (command === "cycle") {
    const cycle = await runAutonomousBuildCycle(rootDir);
    return {
      command,
      successful: false,
      output: `PBOS AUTONOMOUS BUILD CYCLE\n${JSON.stringify(cycle, null, 2)}`,
    };
  }

  if (command === "approve") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    const reasons = [
      ...(!orchestration.input.repository.valid
        ? ["Trusted build context is unavailable."]
        : []),
      ...(!orchestration.executionPackage
        ? ["Certified execution package is unavailable."]
        : []),
      ...(!actorId ? ["Approver identity is required through PBOS_ACTOR_ID."] : []),
    ];
    return {
      command,
      successful: false,
      output: [
        "PBOS HUMAN APPROVAL",
        "Decision: BLOCKED",
        ...reasons,
        "No authority record was created.",
      ].join("\n"),
    };
  }

  if (command === "advance") {
    return {
      command,
      successful: false,
      output: [
        "PBOS MILESTONE ADVANCEMENT",
        "Decision: BLOCKED",
        "A matching trusted context, authorization, successful execution, passing validation, and completion evidence are required.",
        "No manifest transition request was applied.",
      ].join("\n"),
    };
  }

  if (command === "history") {
    const history = loadKernelRuntimeHistory(rootDir);
    return {
      command,
      successful: true,
      output: `PBOS LIFECYCLE HISTORY\n${JSON.stringify(
        history ?? { owner: "kernel-runtime", latest: null, history: [] },
        null,
        2
      )}`,
    };
  }

  if (command === "execution-status") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    const history = loadKernelRuntimeHistory(rootDir);
    return {
      command,
      successful: true,
      output: [
        "PBOS AGENT EXECUTION STATUS",
        `Current Package: ${orchestration.executionPackage?.package_id ?? "NONE"}`,
        "Assigned Agent: NONE",
        `Execution State: ${history?.latest.outcome ?? "NOT_STARTED"}`,
        `Validation State: ${history?.latest.validationResults.every(({ status }) => status === "PASS") ? "PASS" : "NOT_AVAILABLE"}`,
        `Evidence State: ${history?.latest.certification ? "CAPTURED" : "NOT_AVAILABLE"}`,
        `Context Trust: ${orchestration.input.repository.valid ? "TRUSTED" : "INVALID"}`,
      ].join("\n"),
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

  if (command === "next") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    return {
      command,
      successful:
        orchestration.governedRecommendation.recommended_milestone !== null,
      output: [
        "PBOS NEXT ANALYSIS",
        `Current Program: Playbook Platform`,
        `Current Phase: Governed Product Construction`,
        `Next Eligible Milestone: ${orchestration.governedRecommendation.recommended_milestone ?? "NONE"}`,
        `Risk: ${orchestration.governedRecommendation.risk}`,
        `Human Approval: REQUIRED`,
        "",
        JSON.stringify(
          {
            assessment: orchestration.intelligence.assessment,
            recommendation: orchestration.governedRecommendation,
            execution_package_available:
              orchestration.executionPackage !== null,
          },
          null,
          2
        ),
      ].join("\n"),
    };
  }

  if (command === "report") {
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

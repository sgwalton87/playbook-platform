import { runRepositoryKernel } from "../engine/kernel-repository-adapter";
import { formatEngineHealth, getEngineHealth } from "../health/engine-health";
import { runKernelRuntime } from "../runtime/kernel-runtime";
import { runDevelopmentOrchestration } from "../orchestration";
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
  ContextRefreshAuthority,
  applyContextRefreshApproval,
  createContextRefreshApproval,
  loadContextRefreshApproval,
  persistContextRefreshApproval,
} from "../context/refresh";
import {
  createLaunchApproval,
  persistLaunchApproval,
} from "../authority/launch";
import {
  evidenceList,
  evidenceString,
  type FounderEvidenceInput,
} from "./founder-evidence-input";
import {
  buildPBOSRecoveryAssessment,
  collectPBOSRecoveryEvidence,
  formatPBOSRecoveryAssessment,
} from "../recovery";
import { runOperator } from "../operator";
import { artifactDigest } from "../kernel";
import {
  createExecutionApproval,
  createExecutionAuthority,
  issueExecutionAuthorization,
  loadExecutionApproval,
  loadExecutionAuthority,
  loadProviderExecutionAuthorization,
  persistExecutionApproval,
  persistExecutionAuthority,
  persistProviderExecutionAuthorization,
  persistExecutionAuthorityLedgerEntry,
  resolveReusableExecutionAuthority,
  formatReusableExecutionAuthority,
} from "../execution/authority";
import {
  createCodexProviderContract,
  resolveExecutionIdentity,
} from "../execution/providers";
import {
  createCodexCliDelegate,
  ExecutionProviderRegistry,
  registerCodexProvider,
} from "../execution/providers";
import {
  assignExecutionTask,
  persistExecutionAssignment,
  loadExecutionAssignment,
} from "../execution/tasks";
import { evaluateAgentExecutionAdmission } from "../execution/admission";
import { ExecutionFabricRunner } from "../execution/runner";
import {
  assessMilestoneAdvancement,
  loadExecutionEvidence,
  persistMilestoneAdvancement,
  persistExecutionEvidence,
  revalidateExecutionEvidence,
} from "../execution/evidence";
import { runMissionControl } from "../mission-control";
import { runRepositoryAnalysis } from "./repository";

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
  "transition",
  "approve-boundary",
  "approve-refresh",
  "recover",
  "run",
  "mission",
  "fabric-status",
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
  if (command === "mission") {
    const result = await runMissionControl(
      (missionCommand) =>
        dispatchKernelCommand(missionCommand, rootDir, actorId, evidenceInput),
      rootDir
    );
    return { command, successful: result.successful, output: result.output };
  }

  if (command === "fabric-status") {
    return {
      command,
      successful: true,
      output: [
        "PBOS EXECUTION FABRIC",
        "Core: OPERATIONAL",
        "Provider Registry: OPERATIONAL",
        "Provider-Bound Authorization: OPERATIONAL",
        "Assignment and Admission Contracts: OPERATIONAL",
        "Evidence and Advancement Assessment: OPERATIONAL",
        "Production Codex Delegate: OPERATIONAL",
        "Execution Approval Command: OPERATIONAL",
        `Production Dispatch: ${process.env.PBOS_CODEX_EXECUTION_ENABLED === "true" ? "ENABLED" : "PAUSED"}`,
      ].join("\n"),
    };
  }

  if (command === "run") {
    const timestamp = new Date().toISOString();
    const recoveryEvidence = collectPBOSRecoveryEvidence(rootDir, timestamp);
    const recovery = buildPBOSRecoveryAssessment(
      recoveryEvidence,
      timestamp
    );
    const operatorOutput = runOperator(rootDir, "RUN_IT", timestamp);
    if (recovery.recommended_transition === "REFRESH_REQUIRED") {
      if (
        recoveryEvidence.sourceChangeCount === 0 &&
        recoveryEvidence.boundary !== "VALID"
      ) {
        const refreshApproval = loadContextRefreshApproval(rootDir)?.latest ?? null;
        if (
          !refreshApproval ||
          refreshApproval.state !== "APPROVED" ||
          refreshApproval.decision !== "APPROVED"
        ) {
          return { command, successful: true, output: operatorOutput };
        }
        const discovery = discoverTrustedContext(rootDir, timestamp);
        const boundary = createChangeBoundary({
          inventory: createChangeInventory(rootDir, timestamp),
          boundaryType: "BASELINE_ACTIVATION",
          baselineIdentity: discovery.baseline_identity,
          requesterIdentity: refreshApproval.requester_identity,
          approvedFiles: [],
          excludedFiles: [],
          purpose: refreshApproval.decision_reason,
          businessPurpose: "Reconcile an approved committed repository transition.",
          technicalPurpose: "Bind trusted context to the approved repository HEAD.",
          riskAcknowledgment: refreshApproval.risk_acknowledgment,
          creationTimestamp: timestamp,
          expirationTimestamp: refreshApproval.expiration,
        });
        persistChangeBoundary(rootDir, boundary);
        persistLaunchApproval(
          rootDir,
          createLaunchApproval({
            boundary,
            requesterIdentity: refreshApproval.requester_identity,
            reviewerIdentity: refreshApproval.reviewer_identity,
            decision: "APPROVED",
            reason: refreshApproval.decision_reason,
            riskAcknowledgment: refreshApproval.risk_acknowledgment,
            timestamp,
            expiration: refreshApproval.expiration,
          })
        );
      }
      const refreshResult = await dispatchKernelCommand(
        "refresh",
        rootDir,
        actorId,
        evidenceInput
      );
      if (!refreshResult.successful) {
        return {
          command,
          successful: false,
          output: [operatorOutput, "", refreshResult.output].join("\n"),
        };
      }
      const activationResult = await dispatchKernelCommand(
        "context-activate",
        rootDir,
        actorId,
        evidenceInput
      );
      if (!activationResult.successful) {
        return {
          command,
          successful: false,
          output: [
            operatorOutput,
            "",
            refreshResult.output,
            "",
            activationResult.output,
          ].join("\n"),
        };
      }
      const resumed = await dispatchKernelCommand(
        "run",
        rootDir,
        actorId,
        evidenceInput
      );
      return {
        command,
        successful: resumed.successful,
        output: [
          operatorOutput,
          "",
          "PBOS ACTION: Context refresh and activation completed.",
          "",
          resumed.output,
        ].join("\n"),
      };
    }
    if (recovery.recommended_transition === "CONTEXT_ACTIVATION_REQUIRED") {
      const activationResult = await dispatchKernelCommand(
        "context-activate",
        rootDir,
        actorId,
        evidenceInput
      );
      if (!activationResult.successful) {
        return {
          command,
          successful: false,
          output: [operatorOutput, "", activationResult.output].join("\n"),
        };
      }
      return dispatchKernelCommand("run", rootDir, actorId, evidenceInput);
    }
    if (recovery.recommended_transition !== "NONE") {
      return {
        command,
        successful: true,
        output: operatorOutput,
      };
    }
    const orchestration = await runDevelopmentOrchestration(rootDir);
    if (!orchestration.executionPackage) {
      return {
        command,
        successful: false,
        output: [
          operatorOutput,
          "",
          "PBOS EXECUTION",
          "Issue: No certified execution package is eligible.",
          `Cause: ${orchestration.governedRecommendation.blocking_conditions.join(" ") || "Planner produced no eligible milestone."}`,
          "Resolution: Resolve the canonical planner findings.",
        ].join("\n"),
      };
    }
    const context = loadTrustedBuildContext(rootDir)?.latest ?? null;
    const agent = createDefaultAgentRegistry(timestamp).get("PBOS-CODEX-CODE-001");
    const providerBody = agent
      ? createCodexProviderContract({ provider_id: agent.agent_id, version: agent.version })
      : null;
    const provider = providerBody
      ? { ...providerBody, digest: artifactDigest(providerBody) }
      : null;
    const reuse = context && agent && provider
      ? resolveReusableExecutionAuthority({
          rootDir,
          context,
          package: orchestration.executionPackage,
          provider,
          agent,
          expected_scope: orchestration.executionPackage.required_changes,
          timestamp,
        })
      : { valid: false, authority: null, findings: ["Current execution identity is unavailable."] };
    if (!reuse.valid || !reuse.authority) {
      return {
        command,
        successful: true,
        output: [
          operatorOutput,
          "",
          "PBOS HUMAN ACTION REQUIRED",
          "Reason: Package-bound execution approval is required.",
          `Package: ${orchestration.executionPackage.package_id}`,
          `Digest: ${orchestration.executionPackage.digest}`,
          ...reuse.findings.map((finding) => `Reason: ${finding}`),
          "Command: npm run pbos:approve",
        ].join("\n"),
      };
    }
    if (!context) {
      throw new Error("Trusted context disappeared during authority reuse.");
    }
    const { approval, authority, authorization } = reuse.authority;
    const authorityReuseOutput = formatReusableExecutionAuthority(reuse.authority);
    let assignmentArtifact = loadExecutionAssignment(rootDir);
    if (
      !assignmentArtifact ||
      assignmentArtifact.assignment.task.package_id !==
        orchestration.executionPackage.package_id ||
      assignmentArtifact.assignment.task.context_identity !==
        authorization.context_digest ||
      assignmentArtifact.assignment.task.execution_authorization_id !==
        authorization.authorization_id ||
      assignmentArtifact.assignment.task.provider_id !==
        authorization.provider_id ||
      assignmentArtifact.assignment.task.provider_contract_id !==
        authorization.provider_contract_id ||
      assignmentArtifact.assignment.task.assigned_agent !== authorization.agent_id
    ) {
      const assignmentResult = await dispatchKernelCommand(
        "assign",
        rootDir,
        actorId,
        evidenceInput
      );
      if (!assignmentResult.successful) {
        return {
          command,
          successful: false,
          output: [operatorOutput, "", assignmentResult.output].join("\n"),
        };
      }
      assignmentArtifact = loadExecutionAssignment(rootDir);
    }
    if (!assignmentArtifact) {
      throw new Error("Execution assignment was not persisted.");
    }
    const existingEvidence = loadExecutionEvidence(rootDir)?.latest ?? null;
    if (
      existingEvidence &&
      existingEvidence.record.package_digest === orchestration.executionPackage.digest &&
      existingEvidence.record.approval_id === approval.approval_id
    ) {
      let validatedEvidence;
      try {
        validatedEvidence = revalidateExecutionEvidence({
          rootDir,
          evidence: existingEvidence,
          context,
          package: orchestration.executionPackage,
          approval,
          authority,
          authorization,
          assignment: assignmentArtifact.assignment,
        });
      } catch (error) {
        return {
          command,
          successful: false,
          output: [
            "PBOS EXECUTION EVIDENCE RECOVERY",
            "Decision: BLOCKED",
            error instanceof Error ? error.message : String(error),
            "No milestone transition was applied.",
          ].join("\n"),
        };
      }
      const recoveredEvidence = persistExecutionEvidence(
        rootDir,
        validatedEvidence
      ).latest;
      const advancement = assessMilestoneAdvancement({
        package: orchestration.executionPackage,
        evidence: recoveredEvidence,
      });
      const transition = advancement.eligible
        ? persistMilestoneAdvancement({
            rootDir,
            package: orchestration.executionPackage,
            assessment: advancement,
            authorized_by: authorization.approved_by,
            timestamp: recoveredEvidence.record.completed_at,
          }).latest
        : null;
      return {
        command,
        successful: advancement.eligible,
        output: [
          "PBOS OPERATOR MODE",
          authorityReuseOutput,
          "CURRENT STATE: EXECUTION EVIDENCE RECOVERED",
          "AVAILABLE ACTION: Lifecycle advancement assessment",
          "AUTOMATIC ACTIONS: Evidence loaded and validated",
          "HUMAN ACTION REQUIRED: NONE",
          "NEXT COMMAND: npm run it",
          `Execution: ${recoveredEvidence.record.status}`,
          `Evidence: ${recoveredEvidence.completion.evidence_status}`,
          `Validation: ${recoveredEvidence.completion.complete ? "PASS" : "FAIL"}`,
          `Milestone Advancement: ${transition ? "COMPLETE" : "BLOCKED"}`,
          ...advancement.findings.map((finding) => `- ${finding}`),
        ].join("\n"),
      };
    }
    if (process.env.PBOS_CODEX_EXECUTION_ENABLED !== "true") {
      return {
        command,
        successful: true,
        output: [
          operatorOutput,
          "",
          authorityReuseOutput,
          "",
          "PBOS EXECUTION READY",
          `Package: ${orchestration.executionPackage.package_id}`,
          `Authorization: ${authorization.authorization_id}`,
          `Assignment: ${assignmentArtifact.assignment.task.task_id}`,
          "Provider: PBOS-CODEX-CODE-001",
          "Dispatch: PAUSED",
          "Reason: Production Codex delegate is not enabled.",
          "Resolution: Set PBOS_CODEX_EXECUTION_ENABLED=true after provider certification.",
        ].join("\n"),
      };
    }
    const providers = registerCodexProvider({
      registry: new ExecutionProviderRegistry(),
      provider_id: authorization.provider_id,
      version: "1.0.0",
      delegate: createCodexCliDelegate({ rootDir }),
    });
    const fabricResult = await new ExecutionFabricRunner().execute({
      rootDir,
      context,
      package: orchestration.executionPackage,
      approval,
      authority,
      authorization,
      assignment: assignmentArtifact.assignment,
      admission: assignmentArtifact.admission,
      providers,
      requested_at: new Date().toISOString(),
    });
    persistExecutionEvidence(rootDir, fabricResult.evidence);
    const advancement = assessMilestoneAdvancement({
      package: orchestration.executionPackage,
      evidence: fabricResult.evidence,
    });
    const transition = advancement.eligible
      ? persistMilestoneAdvancement({
          rootDir,
          package: orchestration.executionPackage,
          assessment: advancement,
          authorized_by: authorization.approved_by,
          timestamp: new Date().toISOString(),
        }).latest
      : null;
    return {
      command,
      successful: advancement.eligible,
      output: [
        "PBOS OPERATOR MODE",
        authorityReuseOutput,
        "Intent: RUN_IT",
        `Package: ${orchestration.executionPackage.package_id}`,
        `Provider: ${fabricResult.provider_id}`,
        `Execution: ${fabricResult.evidence.record.status}`,
        "Evidence: CAPTURED",
        `Validation: ${fabricResult.evidence.completion.complete ? "PASS" : "FAIL"}`,
        `Milestone Advancement: ${transition ? "COMPLETE" : "BLOCKED"}`,
        ...advancement.findings.map((finding) => `- ${finding}`),
      ].join("\n"),
    };
  }

  if (command === "recover") {
    const timestamp = new Date().toISOString();
    const assessment = buildPBOSRecoveryAssessment(
      collectPBOSRecoveryEvidence(rootDir, timestamp),
      timestamp
    );
    return {
      command,
      successful: true,
      output: formatPBOSRecoveryAssessment(assessment),
    };
  }

  if (command === "change-inventory") {
    const inventory = createChangeInventory(rootDir);
    return {
      command,
      successful: inventory.changes.every(({ owner }) => owner !== "UNKNOWN"),
      output: `PBOS CHANGE INVENTORY\n${JSON.stringify(inventory, null, 2)}`,
    };
  }

  if (command === "transition") {
    const timestamp = new Date().toISOString();
    const requesterIdentity = evidenceString(evidenceInput, "requester-identity");
    const reviewerIdentity = evidenceString(evidenceInput, "reviewer-identity");
    const decision = evidenceString(evidenceInput, "decision").toUpperCase();
    const reason = evidenceString(evidenceInput, "reason");
    const riskAcknowledgment = evidenceString(evidenceInput, "risk-acknowledgment");
    const expiration = evidenceString(evidenceInput, "expiration");
    if (!requesterIdentity || !reviewerIdentity || decision !== "APPROVED" ||
      !reason || !riskAcknowledgment || !expiration) {
      return {
        command,
        successful: false,
        output: [
          "PBOS GOVERNED TRANSITION",
          "Decision: BLOCKED",
          "Requester, independent reviewer, APPROVED decision, reason, risk acknowledgment, and expiration are required.",
          "No transition was performed.",
        ].join("\n"),
      };
    }
    try {
      const inventory = createChangeInventory(rootDir, timestamp);
      if (inventory.changes.length > 0) {
        throw new Error("Baseline activation requires committed application source; approve and commit the inventoried transition first.");
      }
      // repository.json is a replaceable observation, not human authority.
      // Refresh it before context discovery so validation evaluates the current
      // repository branch and HEAD while all identity checks remain fail-closed.
      runRepositoryAnalysis(rootDir);
      const before = discoverTrustedContext(rootDir, timestamp);
      const boundary = createChangeBoundary({
        inventory,
        boundaryType: "BASELINE_ACTIVATION",
        baselineIdentity: before.baseline_identity,
        requesterIdentity,
        approvedFiles: [],
        excludedFiles: [],
        purpose: reason,
        businessPurpose: reason,
        technicalPurpose: "Reconcile and activate the approved repository transition.",
        riskAcknowledgment,
        creationTimestamp: timestamp,
        expirationTimestamp: expiration,
      });
      persistChangeBoundary(rootDir, boundary);
      const approval = createLaunchApproval({
        boundary,
        requesterIdentity,
        reviewerIdentity,
        decision: "APPROVED",
        reason,
        riskAcknowledgment,
        timestamp,
        expiration,
      });
      persistLaunchApproval(rootDir, approval);
      let refresh = "NOT_REQUIRED";
      if (before.reconciliation.state === "REVIEW_REQUIRED") {
        const refreshApproval = createContextRefreshApproval({
          reconciliation: before.reconciliation,
          requesterIdentity,
          reviewerIdentity,
          decision: "APPROVED",
          decisionReason: reason,
          riskAcknowledgment,
          timestamp,
          expiration,
        });
        persistContextRefreshApproval(rootDir, refreshApproval);
        const refreshed = new ContextRefreshAuthority().refreshApproved(rootDir, {
          reconciliation: before.reconciliation,
          approval: refreshApproval,
          timestamp,
        });
        persistContextRefreshApproval(rootDir, applyContextRefreshApproval(
          refreshApproval, refreshed.context.identity, timestamp
        ));
        refresh = "APPLIED";
      } else if (before.reconciliation.state !== "VERIFIED") {
        throw new Error(`Repository reconciliation is ${before.reconciliation.state}.`);
      }
      const resolution = createAuthorityLinkedActivationEvidence(rootDir, timestamp);
      if (!resolution.valid || !resolution.evidence) {
        throw new Error(resolution.findings.join("\n"));
      }
      persistTrustedContext(rootDir, resolution.evidence);
      const after = discoverTrustedContext(rootDir, timestamp);
      const valid = after.reconciliation.state === "VERIFIED";
      return {
        command,
        successful: valid,
        output: [
          "PBOS GOVERNED TRANSITION",
          `Inventory: ${inventory.changes.length} source changes`,
          `Reconciliation: ${after.reconciliation.state}`,
          `Refresh: ${refresh}`,
          "Human Authorization: RECORDED ONCE",
          `Trust Level: ${valid ? "ACTIVE" : "BLOCKED"}`,
          `Validation: ${valid ? "PASS" : "FAIL"}`,
        ].join("\n"),
      };
    } catch (error: unknown) {
      return {
        command,
        successful: false,
        output: ["PBOS GOVERNED TRANSITION", "Decision: BLOCKED",
          error instanceof Error ? error.message : String(error)].join("\n"),
      };
    }
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

  if (command === "approve-refresh") {
    const discovery = discoverTrustedContext(rootDir);
    const requesterIdentity = evidenceString(
      evidenceInput, "requester-identity", process.env.PBOS_REFRESH_REQUESTER_ID
    );
    const reviewerIdentity = evidenceString(
      evidenceInput, "reviewer-identity", process.env.PBOS_REFRESH_REVIEWER_ID
    );
    const decision = evidenceString(
      evidenceInput, "decision", process.env.PBOS_REFRESH_DECISION
    ).toUpperCase();
    const reason = evidenceString(
      evidenceInput, "reason", process.env.PBOS_REFRESH_REASON
    );
    const riskAcknowledgment = evidenceString(
      evidenceInput, "risk-acknowledgment",
      process.env.PBOS_REFRESH_RISK_ACKNOWLEDGMENT
    );
    const expiration = evidenceString(
      evidenceInput, "expiration", process.env.PBOS_REFRESH_EXPIRATION
    );
    if (
      !requesterIdentity ||
      !reviewerIdentity ||
      !["APPROVED", "REJECTED"].includes(decision) ||
      !reason ||
      !riskAcknowledgment ||
      !expiration
    ) {
      return {
        command,
        successful: false,
        output: [
          "PBOS CONTEXT REFRESH AUTHORITY",
          "Decision: BLOCKED",
          "Requester, independent reviewer, APPROVED/REJECTED decision, reason, risk acknowledgment, and expiration are required.",
          "No runtime artifact was created.",
        ].join("\n"),
      };
    }
    const timestamp = new Date().toISOString();
    try {
      const approval = createContextRefreshApproval({
        reconciliation: discovery.reconciliation,
        requesterIdentity,
        reviewerIdentity,
        decision: decision as "APPROVED" | "REJECTED",
        decisionReason: reason,
        riskAcknowledgment,
        timestamp,
        expiration,
      });
      const artifact = persistContextRefreshApproval(rootDir, approval);
      return {
        command,
        successful: true,
        output: `PBOS CONTEXT REFRESH AUTHORITY\n${JSON.stringify(
          { approval, artifact },
          null,
          2
        )}`,
      };
    } catch (error: unknown) {
      return {
        command,
        successful: false,
        output: [
          "PBOS CONTEXT REFRESH AUTHORITY",
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
        `Trust Level: ${readiness.current_capability_level === "GOVERNED_PLANNING" ? "ACTIVE" : "BLOCKED"}`,
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
    const context = loadTrustedBuildContext(rootDir)?.latest ?? null;
    const executionPackage = orchestration.executionPackage;
    const approval = loadExecutionApproval(rootDir)?.latest ?? null;
    const authority = loadExecutionAuthority(rootDir)?.latest ?? null;
    const authorization =
      loadProviderExecutionAuthorization(rootDir)?.latest ?? null;
    const timestamp = new Date().toISOString();
    const registry = createDefaultAgentRegistry(timestamp);
    const agent = registry.get("PBOS-CODEX-CODE-001");
    const providerBody = agent
      ? createCodexProviderContract({
          provider_id: authorization?.provider_id ?? agent.agent_id,
          version: agent.version,
        })
      : null;
    const provider = providerBody
      ? { ...providerBody, digest: artifactDigest(providerBody) }
      : null;
    let identityResolution = null;
    if (provider) {
      try {
        identityResolution = resolveExecutionIdentity({
          provider,
          agents: registry,
          created_at: timestamp,
        });
      } catch (error) {
        identityResolution = null;
      }
    }
    const findings = [
      ...(!orchestration.input.repository.valid ? ["Trusted context is unavailable."] : []),
      ...(!context ? ["Active trusted context is unavailable."] : []),
      ...(!executionPackage ? ["Approved execution package is unavailable."] : []),
      ...(!approval || approval.decision !== "APPROVED"
        ? ["Approved authority record is unavailable."]
        : []),
      ...(!authority ? ["Execution authority record is unavailable."] : []),
      ...(!authorization
        ? ["Provider-bound execution authorization is unavailable."]
        : []),
      ...(!agent ? ["Certified execution agent is unavailable."] : []),
      ...(!provider || !identityResolution
        ? ["Certified provider identity could not be resolved."]
        : []),
      ...(authorization && provider &&
      (authorization.provider_id !== provider.provider_id ||
        authorization.provider_contract_id !== provider.provider_contract_id ||
        authorization.agent_id !== provider.executable_agent_id ||
        authorization.provider_contract_digest !== provider.digest)
        ? ["Execution authorization provider identity does not match."]
        : []),
    ];
    if (
      findings.length > 0 ||
      !context ||
      !executionPackage ||
      !approval ||
      !authority ||
      !authorization ||
      !agent ||
      !provider ||
      !identityResolution
    ) {
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
    const task = {
      task_id: `TASK-${artifactDigest({
        package: executionPackage.digest,
        approval: approval.digest,
        agent: agent.digest,
      }).slice(0, 16)}`,
      package_id: executionPackage.package_id,
      milestone_id: executionPackage.milestone_id,
      context_identity: context.digest,
      authorization_reference: approval.approval_id,
      execution_authorization_id: authorization.authorization_id,
      provider_id: identityResolution.provider_id,
      provider_contract_id: identityResolution.provider_contract_id,
      assigned_agent: identityResolution.agent_id,
      allowed_scope: [...authorization.allowed_actions],
      prohibited_scope: [...authorization.prohibited_actions],
      required_capabilities: ["CODE_GENERATION"],
      validation_requirements: [...executionPackage.validation_requirements],
      evidence_requirements: [...authorization.evidence_requirements],
    };
    const assignment = assignExecutionTask({
      task,
      registry,
      context,
      approval,
      package: executionPackage,
      execution_authorization_id: authorization.authorization_id,
      provider_id: identityResolution.provider_id,
      provider_contract_id: identityResolution.provider_contract_id,
      resolved_agent_id: identityResolution.agent_id,
      required_permissions: [
        "READ_APPROVED_SCOPE",
        "MODIFY_APPROVED_FILES",
        "RUN_TESTS",
        "RUN_VALIDATION",
      ],
    });
    const requestBody = {
      request_id: `ADMISSION-${assignment.task.task_id}`,
      context,
      package: executionPackage,
      package_certification_digest: authority.package_certification_digest,
      execution_authority: authority,
      approval,
      agent,
      identity_resolution: identityResolution,
      assignment,
      requested_at: timestamp,
    };
    const admissionRequest = {
      ...requestBody,
      digest: artifactDigest(requestBody),
    };
    const admission = evaluateAgentExecutionAdmission(
      admissionRequest,
      timestamp
    );
    if (!assignment.assigned || !admission.decision.admitted) {
      return {
        command,
        successful: false,
        output: [
          "PBOS EXECUTION TASK ASSIGNMENT",
          "Decision: BLOCKED",
          ...assignment.findings,
          ...admission.decision.findings,
          "No agent assignment was created.",
        ].join("\n"),
      };
    }
    persistExecutionAssignment(rootDir, assignment, admission);
    return {
      command,
      successful: true,
      output: [
        "PBOS EXECUTION TASK ASSIGNMENT",
        "Decision: ASSIGNED",
        `Task: ${assignment.task.task_id}`,
        `Provider: ${assignment.task.provider_id}`,
        `Provider Contract: ${assignment.task.provider_contract_id}`,
        `Agent: ${assignment.task.assigned_agent}`,
        `Identity Resolution: ${identityResolution.resolution_id}`,
        `Scope: ${assignment.task.allowed_scope.join(", ")}`,
        "Admission: APPROVED",
        "Next action: RUN IT",
      ].join("\n"),
    };
  }

  if (command === "first-build") {
    const result = await dispatchKernelCommand(
      "run",
      rootDir,
      actorId,
      evidenceInput
    );
    return { ...result, command };
  }

  if (command === "cycle") {
    const result = await dispatchKernelCommand(
      "run",
      rootDir,
      actorId,
      evidenceInput
    );
    return { ...result, command };
  }

  if (command === "approve") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    const context = loadTrustedBuildContext(rootDir)?.latest ?? null;
    const executionPackage = orchestration.executionPackage;
    const requester = evidenceString(
      evidenceInput, "requester-identity",
      process.env.PBOS_EXECUTION_REQUESTER_ID
    );
    const reviewer = evidenceString(
      evidenceInput, "reviewer-identity",
      process.env.PBOS_EXECUTION_REVIEWER_ID ?? actorId
    );
    const decision = evidenceString(
      evidenceInput, "decision", process.env.PBOS_EXECUTION_DECISION
    ).toUpperCase();
    const reason = evidenceString(
      evidenceInput, "reason", process.env.PBOS_EXECUTION_REASON
    );
    const riskAcknowledgment = evidenceString(
      evidenceInput, "risk-acknowledgment",
      process.env.PBOS_EXECUTION_RISK_ACKNOWLEDGMENT
    );
    const expiration = evidenceString(
      evidenceInput, "expiration", process.env.PBOS_EXECUTION_EXPIRATION
    );
    const timestamp = new Date().toISOString();
    const reasons = [
      ...(!orchestration.input.repository.valid
        ? ["Trusted build context is unavailable."]
        : []),
      ...(!context ? ["Active trusted context is unavailable."] : []),
      ...(!executionPackage
        ? ["Certified execution package is unavailable."]
        : []),
      ...(!requester ? ["Requester identity is required."] : []),
      ...(!reviewer ? ["Independent reviewer identity is required."] : []),
      ...(requester === reviewer
        ? ["Requester and reviewer must be independent."]
        : []),
      ...(!["APPROVED", "REJECTED"].includes(decision)
        ? ["Decision must be APPROVED or REJECTED."]
        : []),
      ...(!reason ? ["Decision reason is required."] : []),
      ...(!riskAcknowledgment ? ["Risk acknowledgment is required."] : []),
      ...(!expiration || Date.parse(expiration) <= Date.parse(timestamp)
        ? ["A future approval expiration is required."]
        : []),
    ];
    if (reasons.length > 0 || !context || !executionPackage) {
      return {
        command,
        successful: false,
        output: [
          "PBOS HUMAN EXECUTION APPROVAL",
          "Decision: BLOCKED",
          ...reasons,
          "No authority record was created.",
        ].join("\n"),
      };
    }
    const riskLevel = orchestration.governedRecommendation.risk > 70
      ? "RED" as const
      : orchestration.governedRecommendation.risk > 30
        ? "YELLOW" as const
        : "GREEN" as const;
    const scope = executionPackage.required_changes.filter(Boolean);
    if (scope.length === 0) {
      return {
        command,
        successful: false,
        output: "PBOS HUMAN EXECUTION APPROVAL\nDecision: BLOCKED\nExecution package scope is empty.",
      };
    }
    const approval = createExecutionApproval({
      package: executionPackage,
      context,
      requested_by: requester,
      approved_by: reviewer,
      decision: decision === "APPROVED" ? "APPROVED" : "REJECTED",
      reason,
      risk_acknowledgment: riskAcknowledgment,
      risk_level: riskLevel,
      scope,
      timestamp,
      expiration,
    });
    persistExecutionApproval(rootDir, approval);
    if (approval.decision !== "APPROVED") {
      return {
        command,
        successful: false,
        output: [
          "PBOS HUMAN EXECUTION APPROVAL",
          "Decision: REJECTED",
          `Approval: ${approval.approval_id}`,
          "Execution authority was not issued.",
        ].join("\n"),
      };
    }
    const agent = createDefaultAgentRegistry(timestamp).get(
      "PBOS-CODEX-CODE-001"
    );
    if (!agent) throw new Error("Canonical Codex agent registration is missing.");
    const providerBody = createCodexProviderContract({
      provider_id: agent.agent_id,
      version: agent.version,
    });
    const provider = {
      ...providerBody,
      digest: artifactDigest(providerBody),
    };
    const evidenceRequirements = [...provider.evidence_contract];
    const authority = createExecutionAuthority({
      context,
      package: executionPackage,
      packageCertificationDigest: orchestration.kernel.certification.digest,
      approval,
      agent,
      scope,
      blockedOperations: [".git", ".env", "pbos/runtime"],
      requiredCapabilities: ["CODE_GENERATION"],
      evidenceRequirements,
      authorizationTime: timestamp,
      expirationTime: expiration,
    });
    persistExecutionAuthority(rootDir, authority);
    const authorization = issueExecutionAuthorization({
      authority,
      context,
      package: executionPackage,
      provider,
      created_by: requester,
      approved_by: reviewer,
      issued_at: timestamp,
    });
    persistProviderExecutionAuthorization(rootDir, authorization);
    persistExecutionAuthorityLedgerEntry({
      rootDir,
      approval,
      authority,
      authorization,
    });
    return {
      command,
      successful: true,
      output: [
        "PBOS HUMAN EXECUTION APPROVAL",
        "Decision: APPROVED",
        `Approval: ${approval.approval_id}`,
        `Authority: ${authority.execution_authority_id}`,
        `Authorization: ${authorization.authorization_id}`,
        `Provider: ${authorization.provider_id}`,
        "Next action: RUN IT",
      ].join("\n"),
    };
  }

  if (command === "advance") {
    const orchestration = await runDevelopmentOrchestration(rootDir);
    const executionPackage = orchestration.executionPackage;
    const evidence = loadExecutionEvidence(rootDir)?.latest ?? null;
    const authorization =
      loadProviderExecutionAuthorization(rootDir)?.latest ?? null;
    if (!executionPackage || !evidence || !authorization) {
      return {
        command,
        successful: false,
        output: [
          "PBOS MILESTONE ADVANCEMENT",
          "Decision: BLOCKED",
          "A matching execution package, authorization, and evidence bundle are required.",
          "No milestone transition was applied.",
        ].join("\n"),
      };
    }
    const assessment = assessMilestoneAdvancement({
      package: executionPackage,
      evidence,
    });
    if (!assessment.eligible) {
      return {
        command,
        successful: false,
        output: [
          "PBOS MILESTONE ADVANCEMENT",
          "Decision: BLOCKED",
          ...assessment.findings,
          "No milestone transition was applied.",
        ].join("\n"),
      };
    }
    const transition = persistMilestoneAdvancement({
      rootDir,
      package: executionPackage,
      assessment,
      authorized_by: authorization.approved_by,
      timestamp: new Date().toISOString(),
    }).latest;
    return {
      command,
      successful: true,
      output: [
        "PBOS MILESTONE ADVANCEMENT",
        "Decision: COMPLETE",
        `Milestone: ${transition.milestone_id}`,
        `Transition: ${transition.transition_id}`,
        `Evidence: ${transition.evidence_digest}`,
        "Next action: RUN IT",
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
    const timestamp = new Date().toISOString();
    const discovery = discoverTrustedContext(rootDir, timestamp);
    const approval = loadContextRefreshApproval(rootDir)?.latest ?? null;
    if (!approval) {
      return {
        command,
        successful: false,
        output: [
          "PBOS CONTEXT REFRESH GOVERNANCE",
          "Mutation: NOT PERFORMED",
          "An approved reconciliation-bound refresh request is required.",
        ].join("\n"),
      };
    }
    try {
      const result = new ContextRefreshAuthority().refreshApproved(rootDir, {
        reconciliation: discovery.reconciliation,
        approval,
        timestamp,
      });
      const applied = applyContextRefreshApproval(
        approval,
        result.context.identity,
        timestamp
      );
      persistContextRefreshApproval(rootDir, applied);
      return {
        command,
        successful: true,
        output: [
          "PBOS CONTEXT REFRESH GOVERNANCE",
          "Decision: APPLIED",
          `Previous Context: ${approval.previous_context_identity ?? "NONE"}`,
          `Current Context: ${result.context.identity}`,
          "Trusted Context Activation: NOT PERFORMED",
          "Next action: Activate Trusted Context",
        ].join("\n"),
      };
    } catch (error: unknown) {
      return {
        command,
        successful: false,
        output: [
          "PBOS CONTEXT REFRESH GOVERNANCE",
          "Mutation: NOT PERFORMED",
          error instanceof Error ? error.message : String(error),
        ].join("\n"),
      };
    }
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
    const result = await dispatchKernelCommand(
      "approve",
      rootDir,
      actorId,
      evidenceInput
    );
    return { ...result, command };
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

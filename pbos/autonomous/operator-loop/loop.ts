import { createDefaultAgentRegistry } from "../../agents/registry";
import {
  assessAutonomousReadiness,
  discoverTrustedContext,
  loadTrustedBuildContext,
} from "../../context/activation";
import { artifactDigest } from "../../kernel/identity";
import { loadMasterBuildManifest } from "../../manifests";
import { runDevelopmentOrchestration } from "../../orchestration";
import { loadExecutionAuthority } from "../../execution/authority";
import { loadChangeBoundary } from "../../context/change-boundary";
import { loadLaunchApproval } from "../../authority/launch";
import { AutonomousRiskRouter } from "../risk-router";
import { checkMissionAlignment } from "./mission";
import type {
  FounderOperatingLoopResult,
  PBOSReadinessGuidance,
} from "./types";

function contextGuidance(reason: string): PBOSReadinessGuidance {
  return {
    current_blocker: "Trusted Build Context is not current.",
    business_impact: "PBOS cannot select or execute product work against untrusted repository reality.",
    why: reason,
    required_resolution: [
      "Commit or otherwise resolve current repository changes.",
      "Regenerate stale runtime artifacts through canonical owners.",
      "Reconcile repository identity.",
      "Record human approval and activate the final context.",
    ],
    responsible_authority: "PBOS Context Activation Authority and human reviewer",
    commands: [
      "npm run pbos:context-status",
      "npm run pbos:context-reconcile",
      "npm run pbos:context-activate",
    ],
    expected_next_state: "Governed planning becomes available.",
  };
}

export class FounderOperatingLoop {
  async run(
    rootDir = process.cwd(),
    timestamp = new Date().toISOString()
  ): Promise<FounderOperatingLoopResult> {
    const discovery = discoverTrustedContext(rootDir, timestamp);
    const trusted = loadTrustedBuildContext(rootDir)?.latest ?? null;
    const changeBoundary = loadChangeBoundary(rootDir)?.latest ?? null;
    const launchApproval = loadLaunchApproval(rootDir)?.latest ?? null;
    const contextReadiness = assessAutonomousReadiness({
      context: trusted,
      repository: discovery.assessment,
      timestamp,
    });
    const orchestration = await runDevelopmentOrchestration(rootDir);
    const mission = checkMissionAlignment(orchestration.intelligence);
    const manifest = loadMasterBuildManifest(rootDir);
    const milestone = manifest.manifest.milestones.find(
      ({ id }) => id === orchestration.governedRecommendation.recommended_milestone
    ) ?? null;
    const risk = milestone ? new AutonomousRiskRouter().route(milestone) : null;
    const agentAvailable =
      createDefaultAgentRegistry(timestamp).snapshot().agents.some(
        ({ status }) => status === "REGISTERED"
      );
    const executionAuthority = loadExecutionAuthority(rootDir)?.latest ?? null;
    const authorityAvailable =
      executionAuthority !== null &&
      trusted !== null &&
      orchestration.executionPackage !== null &&
      executionAuthority.authority_status === "AUTHORIZED" &&
      executionAuthority.context_digest === trusted.digest &&
      executionAuthority.package_digest === orchestration.executionPackage.digest &&
      Date.parse(executionAuthority.expiration_time) > Date.parse(timestamp);
    const contextRejected = discovery.reconciliation.state === "REJECTED";
    const blocked = contextRejected || !mission.aligned;
    const prepared =
      !blocked &&
      contextReadiness.current_capability_level === "GOVERNED_PLANNING" &&
      orchestration.executionPackage !== null &&
      milestone !== null &&
      agentAvailable;
    const guidance = blocked
      ? {
          current_blocker: contextRejected
            ? "Repository identity reconciliation was rejected."
            : "Mission or governance alignment failed.",
          business_impact: "Autonomous planning and execution are prohibited until enterprise trust is restored.",
          why: [...discovery.reconciliation.differences.map(({ resolution }) => resolution), ...mission.findings].join(" "),
          required_resolution: ["Resolve the reported authority or architecture conflict through its canonical owner."],
          responsible_authority: contextRejected
            ? "PBOS Repository Context Authority"
            : "PBOS Constitutional Governance Authority",
          commands: ["npm run pbos:status", "npm run pbos:context-reconcile"],
          expected_next_state: "The blocking authority reports VERIFIED.",
        }
      : contextReadiness.current_capability_level !== "GOVERNED_PLANNING"
        ? contextGuidance(discovery.assessment.findings.join(" "))
        : !orchestration.executionPackage
          ? {
              current_blocker: "No certified execution package is available.",
              business_impact: "No bounded business or technical objective can enter authorization.",
              why: orchestration.governedRecommendation.blocking_conditions.join(" "),
              required_resolution: ["Resolve the planner blocking conditions through their canonical owners."],
              responsible_authority: "PBOS Constitutional Planner",
              commands: ["npm run pbos:analyze", "npm run pbos:recommend", "npm run pbos:next"],
              expected_next_state: "One certified next play and package become available.",
            }
          : !agentAvailable
            ? {
                current_blocker: "No registered execution agent is available.",
                business_impact: "Approved work cannot be assigned to a qualified execution resource.",
                why: "Execution admission requires a registered, capability-compatible agent.",
                required_resolution: ["Restore an agent through the canonical agent registry."],
                responsible_authority: "PBOS Agent Registry",
                commands: ["npm run pbos:agents"],
                expected_next_state: "Agent assignment becomes eligible.",
              }
            : !authorityAvailable
              ? {
                current_blocker: "Execution authority has not been presented.",
                business_impact: "Prepared work cannot enter execution without accountable human authorization.",
                why: "The founder command cannot create or infer approval.",
                required_resolution: ["Review the package and record the required human authority."],
                responsible_authority: "Human Mission Authority and PBOS Execution Authority",
                commands: ["npm run pbos:plan", "npm run pbos:approve", "npm run it"],
                expected_next_state: "Execution admission can evaluate the approved package.",
              }
              : {
                  current_blocker: "Governed task assignment and execution admission remain required.",
                  business_impact: "Authorized work cannot start until its executor and scope pass admission.",
                  why: "Execution authority is valid, but execution cannot begin before agent assignment and admission evidence.",
                  required_resolution: ["Run the canonical assignment and admission path."],
                  responsible_authority: "PBOS Task Assignment and Execution Admission",
                  commands: ["npm run pbos:assign", "npm run it"],
                  expected_next_state: "The authorized agent may execute the admitted package.",
                };
    const readiness = blocked ? "BLOCKED" as const : "NOT_READY" as const;
    const launchStatus = blocked ? "ABORT" as const : "HOLD" as const;
    const launchReadinessBody = {
      assessment_id: `LAUNCH-READINESS-${artifactDigest({
        repository: discovery.assessment.digest,
        context: trusted?.digest ?? null,
        authority: executionAuthority?.digest ?? null,
      }).slice(0, 16)}`,
      launch_status: launchStatus,
      system_status: blocked
        ? "Critical trust or governance validation failed."
        : "PBOS is healthy but operational prerequisites are incomplete.",
      current_blockers: guidance ? [guidance.current_blocker] : [],
      business_impact: guidance?.business_impact ?? "No autonomous execution is eligible.",
      technical_explanation: guidance?.why ?? "Required evidence is unavailable.",
      responsible_authority: guidance?.responsible_authority ?? "PBOS Mission Control",
      required_remediation: guidance?.required_resolution ?? [],
      expected_resolution_state: guidance?.expected_next_state ?? "Launch status becomes GO.",
      timestamp,
    };
    const launch_readiness = {
      ...launchReadinessBody,
      digest: artifactDigest(launchReadinessBody),
    };
    const missionControlBody = {
      current_mission: mission.mission,
      current_state: readiness,
      current_blockers: guidance ? [guidance.current_blocker] : [],
      current_authority: guidance?.responsible_authority ?? "PBOS Execution Admission",
      current_execution: "NOT_STARTED",
      current_outcome: blocked ? "STOPPED_SAFELY" : prepared ? "AWAITING_AUTHORITY" : "NOT_READY",
      next_action: guidance?.required_resolution[0] ?? "Evaluate the next governed play.",
      launch_status: launchStatus,
      authority_state: executionAuthority
        ? authorityAvailable ? "ACTIVE" as const : "INVALID" as const
        : "MISSING" as const,
      execution_state: "NOT_STARTED" as const,
      evidence_state: "NOT_AVAILABLE" as const,
      change_boundary_status: changeBoundary
        ? discovery.activation_snapshot.change_boundary_valid
          ? "APPROVED" as const
          : "INVALID" as const
        : "MISSING" as const,
      boundary_type: changeBoundary?.boundary_type ?? "NONE" as const,
      launch_approval_status: launchApproval
        ? discovery.activation_snapshot.launch_approval_valid &&
          launchApproval.decision === "APPROVED"
          ? "APPROVED" as const
          : launchApproval.decision === "REJECTED"
            ? "REJECTED" as const
            : "INVALID" as const
        : "MISSING" as const,
      context_status: trusted
        ? contextReadiness.current_capability_level === "GOVERNED_PLANNING"
          ? "TRUSTED" as const
          : "INVALID" as const
        : "MISSING" as const,
    };
    const mission_control = {
      ...missionControlBody,
      digest: artifactDigest(missionControlBody),
    };
    const body = {
      loop_id: `FOUNDER-LOOP-${artifactDigest({
        context: discovery.assessment.digest,
        orchestration: orchestration.intelligence.digest,
      }).slice(0, 16)}`,
      readiness,
      phases_completed: prepared
        ? ["OBSERVE", "UNDERSTAND", "PLAN", "ASSESS"]
        : ["OBSERVE", "UNDERSTAND"],
      mission_alignment: mission,
      next_play: milestone?.id ?? null,
      risk,
      guidance,
      mission_control,
      launch_readiness,
      outcome: blocked
        ? "STOPPED_SAFELY" as const
        : prepared
          ? "AWAITING_AUTHORITY" as const
          : "STOPPED_SAFELY" as const,
      mutation: "NOT_PERFORMED" as const,
      evidence: [
        discovery.assessment.digest,
        discovery.reconciliation.digest,
        contextReadiness.digest,
        mission.digest,
        orchestration.intelligence.digest,
        ...(risk ? [risk.digest] : []),
        ...(executionAuthority ? [executionAuthority.digest] : []),
        launch_readiness.digest,
      ],
    };
    return { ...body, digest: artifactDigest(body) };
  }
}

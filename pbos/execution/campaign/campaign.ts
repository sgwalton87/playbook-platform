import { loadTrustedBuildContext } from "../../context/activation";
import { artifactDigest } from "../../kernel";
import { loadMasterBuildManifest, type BuildMilestone } from "../../manifests";
import type { CodexExecutionPackage } from "../../orchestration";
import {
  loadCampaignApproval, loadCampaignProgress, loadExecutionCampaign,
  persistCampaignApproval, persistCampaignProgress, persistExecutionCampaign,
} from "./store";
import type {
  CampaignApproval, CampaignAuthorizationAssessment, CampaignPackage,
  CampaignProgress, CampaignProgressEntry, ExecutionCampaign,
} from "./types";

const PROHIBITED = [".env", ".git", "pbos/runtime", "supabase/migrations", "pbos/authority", "pbos/constitution", "pbos/kernel", "pbos/context/development-trust"];
const STOP_CONDITIONS = ["PACKAGE_DIGEST_CHANGED", "SCOPE_DRIFT", "VALIDATION_FAILED", "PROTECTED_CHANGE", "MIGRATION", "PRODUCTION_PROMOTION", "EXPIRED", "REVOKED"];

function prohibitedPath(value: string): boolean {
  return PROHIBITED.some((blocked) => value === blocked || value.startsWith(`${blocked}/`));
}

export function campaignPackageIdentity(milestone: BuildMilestone): string {
  return artifactDigest({
    milestone_id: milestone.id, version: milestone.version,
    dependencies: [...milestone.dependencies].sort(),
    allowed_paths: [...milestone.outputs].sort(),
    required_validations: [...milestone.validation_requirements].sort(),
    completion_definition: [...milestone.completion_definition],
    risk_level: milestone.risk_level,
  });
}

function eligible(milestone: BuildMilestone): boolean {
  return ["READY", "DEFINED"].includes(milestone.status) &&
    milestone.risk_level !== "RED" && milestone.outputs.length > 0 &&
    milestone.approval_level === "HUMAN" &&
    milestone.outputs.every((output) => !prohibitedPath(output));
}

export function createExecutionCampaign(input: {
  readonly rootDir: string; readonly limit: number; readonly timestamp: string;
  readonly startMilestoneId?: string | null;
}): ExecutionCampaign {
  if (!Number.isInteger(input.limit) || input.limit < 5 || input.limit > 10) {
    throw new Error("Campaign size must be between 5 and 10 packages.");
  }
  const manifest = loadMasterBuildManifest(input.rootDir).manifest;
  const context = loadTrustedBuildContext(input.rootDir)?.latest ?? null;
  if (!context) throw new Error("Active trusted context is required.");
  const candidates = manifest.milestones.filter(eligible);
  const startIndex = input.startMilestoneId
    ? candidates.findIndex(({ id }) => id === input.startMilestoneId)
    : 0;
  if (startIndex < 0) {
    throw new Error(`Certified starting milestone ${input.startMilestoneId} is not campaign eligible.`);
  }
  const selected = candidates.slice(startIndex, startIndex + input.limit);
  if (selected.length < input.limit) {
    throw new Error(`Only ${selected.length} deterministic non-RED packages are available.`);
  }
  const packages: CampaignPackage[] = selected.map((milestone, index) => ({
    position: index + 1,
    milestone_id: milestone.id,
    package_digest: campaignPackageIdentity(milestone),
    risk_level: milestone.risk_level as "GREEN" | "YELLOW",
    dependencies: [...milestone.dependencies],
    allowed_paths: [...milestone.outputs].sort(),
    required_validations: [...milestone.validation_requirements].sort(),
  }));
  const identity = artifactDigest({ repository: context.repository_identity, branch: context.branch_identity, packages });
  const body = {
    campaign_id: `EXECUTION-CAMPAIGN-${identity.slice(0, 16)}`,
    repository_identity: context.repository_identity,
    branch_identity: context.branch_identity,
    provider_id: "PBOS-CODEX-CODE-001" as const,
    maximum_packages: input.limit,
    aggregate_risk: packages.reduce((sum, item) => sum + (item.risk_level === "YELLOW" ? 60 : 20), 0),
    packages,
    prohibited_actions: PROHIBITED,
    stop_conditions: STOP_CONDITIONS,
    created_at: input.timestamp,
    status: "PROPOSED" as const,
  };
  const campaign = { ...body, digest: artifactDigest(body) };
  persistExecutionCampaign(input.rootDir, campaign);
  const progressBody = {
    campaign_id: campaign.campaign_id,
    campaign_digest: campaign.digest,
    entries: packages.map((item): CampaignProgressEntry => ({
      milestone_id: item.milestone_id, package_digest: item.package_digest,
      status: "PENDING", execution_authorization_id: null, updated_at: input.timestamp,
    })),
  };
  persistCampaignProgress(input.rootDir, { ...progressBody, digest: artifactDigest(progressBody) });
  return campaign;
}

export function approveExecutionCampaign(input: {
  readonly rootDir: string; readonly requester: string; readonly reviewer: string;
  readonly decision: "APPROVED" | "REJECTED"; readonly reason: string;
  readonly riskAcknowledgment: string; readonly timestamp: string; readonly expiration: string;
}): CampaignApproval {
  const campaign = loadExecutionCampaign(input.rootDir);
  if (!campaign || campaign.status !== "PROPOSED") throw new Error("A proposed campaign is required.");
  if (!input.requester || !input.reviewer || input.requester === input.reviewer ||
      !input.reason || !input.riskAcknowledgment || Date.parse(input.expiration) <= Date.parse(input.timestamp)) {
    throw new Error("Campaign approval evidence is incomplete.");
  }
  const authorizedCampaign = input.decision === "APPROVED"
    ? persistExecutionCampaign(input.rootDir, { ...campaign, status: "ACTIVE", digest: "" })
    : campaign;
  if (input.decision === "APPROVED") {
    const progress = loadCampaignProgress(input.rootDir);
    if (!progress) throw new Error("Campaign progress is unavailable.");
    persistCampaignProgress(input.rootDir, {
      ...progress,
      campaign_digest: authorizedCampaign.digest,
      digest: "",
    });
  }
  const identity = artifactDigest({ campaign: authorizedCampaign.digest, requester: input.requester, reviewer: input.reviewer });
  const body = {
    approval_id: `CAMPAIGN-APPROVAL-${identity.slice(0, 16)}`,
    campaign_id: authorizedCampaign.campaign_id, campaign_digest: authorizedCampaign.digest,
    requester_identity: input.requester, reviewer_identity: input.reviewer,
    decision: input.decision, reason: input.reason,
    risk_acknowledgment: input.riskAcknowledgment,
    timestamp: input.timestamp, expiration: input.expiration,
  };
  const approval = persistCampaignApproval(input.rootDir, { ...body, digest: artifactDigest(body) });
  return approval;
}

function equal(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function resolveCampaignAuthorization(input: {
  readonly rootDir: string; readonly package: CodexExecutionPackage; readonly timestamp: string;
}): CampaignAuthorizationAssessment {
  const campaign = loadExecutionCampaign(input.rootDir);
  const approval = loadCampaignApproval(input.rootDir);
  const progress = loadCampaignProgress(input.rootDir);
  const context = loadTrustedBuildContext(input.rootDir)?.latest ?? null;
  const manifest = loadMasterBuildManifest(input.rootDir).manifest;
  const member = campaign?.packages.find(({ milestone_id }) => milestone_id === input.package.milestone_id) ?? null;
  const milestone = manifest.milestones.find(({ id }) => id === member?.milestone_id) ?? null;
  const progressEntry = progress?.entries.find(({ milestone_id }) => milestone_id === member?.milestone_id) ?? null;
  const pending = progress?.entries.find(({ status }) => status !== "COMPLETE") ?? null;
  const findings = [
    ...(!campaign || campaign.status !== "ACTIVE" ? ["No active execution campaign exists."] : []),
    ...(!approval || approval.decision !== "APPROVED" ? ["Campaign human approval is unavailable."] : []),
    ...(approval && Date.parse(approval.expiration) <= Date.parse(input.timestamp) ? ["Campaign approval expired."] : []),
    ...(campaign && approval && approval.campaign_digest !== campaign.digest ? ["Campaign approval digest changed."] : []),
    ...(!member || !milestone ? ["Execution package is outside the approved campaign."] : []),
    ...(member && milestone && member.package_digest !== campaignPackageIdentity(milestone) ? ["Campaign package digest changed."] : []),
    ...(member && !equal(member.allowed_paths, input.package.required_changes) ? ["Execution package scope changed."] : []),
    ...(member && pending?.milestone_id !== member.milestone_id ? ["Execution package is out of campaign order."] : []),
    ...(progressEntry?.status === "COMPLETE" ? ["Campaign package is already complete."] : []),
    ...(campaign && context && (campaign.repository_identity !== context.repository_identity || campaign.branch_identity !== context.branch_identity)
      ? ["Trusted repository or branch changed."] : []),
  ];
  return { valid: findings.length === 0, campaign, approval, package: member, findings };
}

export function updateCampaignProgress(input: {
  readonly rootDir: string; readonly milestoneId: string;
  readonly status: CampaignProgressEntry["status"];
  readonly authorizationId?: string; readonly timestamp: string;
}): CampaignProgress {
  const progress = loadCampaignProgress(input.rootDir);
  if (!progress) throw new Error("Campaign progress is unavailable.");
  const body = {
    ...progress,
    entries: progress.entries.map((entry) => entry.milestone_id === input.milestoneId ? {
      ...entry, status: input.status,
      execution_authorization_id: input.authorizationId ?? entry.execution_authorization_id,
      updated_at: input.timestamp,
    } : entry),
    digest: undefined,
  };
  const updated = persistCampaignProgress(
    input.rootDir,
    { ...body, digest: artifactDigest(body) } as CampaignProgress
  );
  const campaign = loadExecutionCampaign(input.rootDir);
  if (campaign) {
    const status = updated.entries.every((entry) => entry.status === "COMPLETE")
      ? "COMPLETE" as const
      : campaign.status;
    if (status !== campaign.status) {
      persistExecutionCampaign(input.rootDir, { ...campaign, status, digest: "" });
    }
  }
  return updated;
}

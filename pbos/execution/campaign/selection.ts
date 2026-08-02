import { artifactDigest } from "../../kernel";
import {
  DependencyGraph,
  DeterministicEligibilityEngine,
  type KernelInput,
} from "../../kernel/execution";
import { loadCampaignApproval, loadCampaignProgress, loadExecutionCampaign } from "./store";
import type { CampaignPackageStatus } from "./types";

const SELECTABLE: readonly CampaignPackageStatus[] = ["PENDING", "FAILED", "AUTHORIZED"];

export interface CampaignMilestoneSelection {
  readonly constrained: boolean;
  readonly milestone_id: string | null;
  readonly findings: readonly string[];
}

export function resolveCampaignMilestoneSelection(input: {
  readonly rootDir: string;
  readonly timestamp: string;
}): CampaignMilestoneSelection {
  const campaign = loadExecutionCampaign(input.rootDir);
  if (!campaign || campaign.status !== "ACTIVE") {
    return { constrained: false, milestone_id: null, findings: [] };
  }

  const approval = loadCampaignApproval(input.rootDir);
  const progress = loadCampaignProgress(input.rootDir);
  const findings = [
    ...(!approval || approval.decision !== "APPROVED"
      ? ["Active campaign approval is unavailable."]
      : []),
    ...(approval && approval.campaign_id !== campaign.campaign_id
      ? ["Campaign approval identity does not match."]
      : []),
    ...(approval && approval.campaign_digest !== campaign.digest
      ? ["Campaign approval digest changed."]
      : []),
    ...(approval && Date.parse(approval.expiration) <= Date.parse(input.timestamp)
      ? ["Campaign approval expired."]
      : []),
    ...(!progress || progress.campaign_id !== campaign.campaign_id
      ? ["Campaign progress is unavailable or does not match."]
      : []),
    ...(progress && progress.campaign_digest !== campaign.digest
      ? ["Campaign progress digest changed."]
      : []),
  ];
  if (findings.length > 0 || !progress) {
    return { constrained: true, milestone_id: null, findings };
  }

  const entryByMilestone = new Map(
    progress.entries.map((entry) => [entry.milestone_id, entry] as const),
  );
  const ordered = [...campaign.packages].sort(
    (left, right) => left.position - right.position || left.milestone_id.localeCompare(right.milestone_id),
  );
  const missing = ordered.find((item) => !entryByMilestone.has(item.milestone_id));
  if (missing) {
    return {
      constrained: true,
      milestone_id: null,
      findings: [`Campaign progress is missing package ${missing.milestone_id}.`],
    };
  }
  const next = ordered.find((item) => {
    const status = entryByMilestone.get(item.milestone_id)?.status;
    return status ? SELECTABLE.includes(status) : false;
  });
  if (!next) {
    return {
      constrained: true,
      milestone_id: null,
      findings: ["Active campaign has no pending, failed, or authorized package."],
    };
  }
  return { constrained: true, milestone_id: next.milestone_id, findings: [] };
}

export function constrainKernelInputToCampaign(input: {
  readonly kernelInput: KernelInput;
  readonly selection: CampaignMilestoneSelection;
}): { readonly input: KernelInput; readonly findings: readonly string[] } {
  if (!input.selection.constrained || !input.selection.milestone_id) {
    return { input: input.kernelInput, findings: input.selection.findings };
  }
  const target = input.kernelInput.registry.objectives.find(
    ({ id }) => id === input.selection.milestone_id,
  );
  if (!target) {
    return {
      input: input.kernelInput,
      findings: [`Campaign package ${input.selection.milestone_id} is absent from the constitutional registry.`],
    };
  }

  const objectives = input.kernelInput.registry.objectives.map((objective) =>
    objective.id !== target.id && objective.state === "READY"
      ? { ...objective, state: "DEFERRED" as const }
      : objective,
  );
  const registryBody = {
    id: input.kernelInput.registry.id,
    rootObjectiveIds: input.kernelInput.registry.rootObjectiveIds,
    objectives,
  };
  const constrainedInput: KernelInput = {
    ...input.kernelInput,
    registry: { ...registryBody, digest: artifactDigest(registryBody) },
  };
  const graph = new DependencyGraph().validate(
    constrainedInput.registry.objectives,
    constrainedInput.registry.rootObjectiveIds,
  );
  const eligibility = new DeterministicEligibilityEngine().evaluate(
    constrainedInput.registry.objectives,
    graph,
    {
      repositoryValid: constrainedInput.repository.valid,
      runtimeValid: constrainedInput.runtime.valid,
      constitutionValid: Boolean(constrainedInput.constitution.id && constrainedInput.constitution.digest),
      registryValid: true,
    },
  );
  const targetEligibility = eligibility.find(({ objectiveId }) => objectiveId === target.id);
  return {
    input: constrainedInput,
    findings: targetEligibility?.eligible
      ? []
      : [...new Set(
          (targetEligibility?.reasons ?? [`Campaign package ${target.id} has no eligibility result.`])
            .map((finding) => `${target.id}:${finding}`),
        )],
  };
}

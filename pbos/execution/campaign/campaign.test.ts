import { cpSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  loadTrustedBuildContext,
  persistTrustedContextRecord,
  type TrustedBuildContext,
} from "../../context/activation";
import { artifactDigest } from "../../kernel";
import { loadMasterBuildManifest } from "../../manifests";
import type { CodexExecutionPackage } from "../../orchestration";
import {
  approveExecutionCampaign, createExecutionCampaign, resolveCampaignAuthorization,
  updateCampaignProgress,
} from "./campaign";
import { resolveCampaignMilestoneSelection } from "./selection";

const roots: string[] = [];
const now = "2026-08-02T20:00:00.000Z";

function fixture(): string {
  const rootDir = mkdtempSync(path.join(tmpdir(), "pbos-campaign-"));
  roots.push(rootDir);
  mkdirSync(path.join(rootDir, "pbos", "manifests"), { recursive: true });
  cpSync(
    path.join(process.cwd(), "pbos", "manifests", "playbook-master-manifest.yaml"),
    path.join(rootDir, "pbos", "manifests", "playbook-master-manifest.yaml")
  );
  const contextBody: Omit<TrustedBuildContext, "digest"> = {
    context_id: "CONTEXT-001", repository_identity: "playbook-platform",
    commit_identity: "a".repeat(40), branch_identity: "main",
    manifest_digest: "b".repeat(64), artifact_digest: "c".repeat(64),
    architecture_digest: "d".repeat(64), governance_digest: "e".repeat(64),
    change_boundary_identity: "f".repeat(64), launch_approval_identity: "1".repeat(64),
    activation_decision_id: "DECISION-001", created_timestamp: now,
    expiration_timestamp: "2027-08-02T23:59:59.000Z", created_by: "TEST",
  };
  persistTrustedContextRecord(rootDir, { ...contextBody, digest: artifactDigest(contextBody) });
  return rootDir;
}

function executionPackage(rootDir: string, milestoneId: string): CodexExecutionPackage {
  const milestone = loadMasterBuildManifest(rootDir).manifest.milestones.find(({ id }) => id === milestoneId)!;
  const body = {
    package_id: `CODEX-${milestone.id}`, milestone_id: milestone.id,
    mission: milestone.description, context: [], current_state: [],
    dependencies: [...milestone.dependencies], required_changes: [...milestone.outputs],
    implementation_requirements: [...milestone.completion_definition],
    security_requirements: ["Fail closed."],
    validation_requirements: [...milestone.validation_requirements],
    documentation_requirements: milestone.outputs.filter((item) => item.startsWith("docs/")),
    completion_criteria: [...milestone.completion_definition],
    human_approval_required: true as const, recommendation_digest: "2".repeat(64),
    timestamp: now,
  };
  return { ...body, digest: artifactDigest(body) };
}

afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));

describe("PBOS execution campaigns", () => {
  it("authorizes ten ordered deterministic packages with one approval", () => {
    const rootDir = fixture();
    const campaign = createExecutionCampaign({ rootDir, limit: 10, timestamp: now });
    expect(campaign.packages).toHaveLength(10);
    expect(campaign.packages.every(({ risk_level }) => risk_level !== ("RED" as never))).toBe(true);
    const approval = approveExecutionCampaign({
      rootDir, requester: "REQUESTER", reviewer: "REVIEWER", decision: "APPROVED",
      reason: "Approve the bounded campaign.", riskAcknowledgment: "Accepted.",
      timestamp: now, expiration: "2027-08-02T23:59:59.000Z",
    });
    expect(approval.decision).toBe("APPROVED");
    const first = campaign.packages[0]!;
    expect(resolveCampaignAuthorization({
      rootDir, package: executionPackage(rootDir, first.milestone_id), timestamp: now,
    }).valid).toBe(true);
    const current = loadTrustedBuildContext(rootDir)!.latest;
    const advancedBody = {
      ...current,
      commit_identity: "9".repeat(40),
      context_id: "CONTEXT-ADVANCED",
      digest: undefined,
    };
    persistTrustedContextRecord(rootDir, {
      ...advancedBody,
      digest: artifactDigest(advancedBody),
    } as TrustedBuildContext);
    expect(resolveCampaignAuthorization({
      rootDir, package: executionPackage(rootDir, first.milestone_id), timestamp: now,
    }).valid).toBe(true);
  });

  it("fails closed for scope drift, out-of-order work, and oversized campaigns", () => {
    const rootDir = fixture();
    const campaign = createExecutionCampaign({ rootDir, limit: 5, timestamp: now });
    approveExecutionCampaign({
      rootDir, requester: "REQUESTER", reviewer: "REVIEWER", decision: "APPROVED",
      reason: "Approve.", riskAcknowledgment: "Accepted.", timestamp: now,
      expiration: "2027-08-02T23:59:59.000Z",
    });
    const first = campaign.packages[0]!;
    const changed = { ...executionPackage(rootDir, first.milestone_id), required_changes: ["app/outside.tsx"] };
    expect(resolveCampaignAuthorization({ rootDir, package: changed, timestamp: now }).findings)
      .toContain("Execution package scope changed.");
    const second = campaign.packages[1]!;
    expect(resolveCampaignAuthorization({
      rootDir, package: executionPackage(rootDir, second.milestone_id), timestamp: now,
    }).findings).toContain("Execution package is out of campaign order.");
    expect(() => createExecutionCampaign({ rootDir, limit: 11, timestamp: now }))
      .toThrow("between 5 and 10");
  });

  it("persists progress and prevents duplicate execution", () => {
    const rootDir = fixture();
    const campaign = createExecutionCampaign({ rootDir, limit: 5, timestamp: now });
    approveExecutionCampaign({
      rootDir, requester: "REQUESTER", reviewer: "REVIEWER", decision: "APPROVED",
      reason: "Approve.", riskAcknowledgment: "Accepted.", timestamp: now,
      expiration: "2027-08-02T23:59:59.000Z",
    });
    const first = campaign.packages[0]!;
    updateCampaignProgress({ rootDir, milestoneId: first.milestone_id, status: "COMPLETE", timestamp: now });
    const repeated = resolveCampaignAuthorization({
      rootDir, package: executionPackage(rootDir, first.milestone_id), timestamp: now,
    });
    expect(repeated.findings).toContain("Campaign package is already complete.");
    const second = campaign.packages[1]!;
    expect(resolveCampaignAuthorization({
      rootDir, package: executionPackage(rootDir, second.milestone_id), timestamp: now,
    }).valid).toBe(true);
  });

  it("selects package four after three completions and reuses campaign approval for retries", () => {
    const rootDir = fixture();
    const campaign = createExecutionCampaign({
      rootDir,
      limit: 10,
      timestamp: now,
      startMilestoneId: "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001",
    });
    const approval = approveExecutionCampaign({
      rootDir, requester: "REQUESTER", reviewer: "REVIEWER", decision: "APPROVED",
      reason: "Approve.", riskAcknowledgment: "Accepted.", timestamp: now,
      expiration: "2027-08-02T23:59:59.000Z",
    });
    campaign.packages.slice(0, 3).forEach(({ milestone_id }) =>
      updateCampaignProgress({ rootDir, milestoneId: milestone_id, status: "COMPLETE", timestamp: now })
    );
    const fourth = campaign.packages[3]!;
    expect(fourth.milestone_id).toBe("PLAYBOOK-ROLE-ACTIVATION-FOUNDATION-001");
    expect(resolveCampaignMilestoneSelection({ rootDir, timestamp: now }).milestone_id)
      .toBe(fourth.milestone_id);
    expect(resolveCampaignAuthorization({
      rootDir, package: executionPackage(rootDir, fourth.milestone_id), timestamp: now,
    })).toMatchObject({ valid: true, approval: { approval_id: approval.approval_id } });

    updateCampaignProgress({ rootDir, milestoneId: fourth.milestone_id, status: "FAILED", timestamp: now });
    expect(resolveCampaignMilestoneSelection({ rootDir, timestamp: now }).milestone_id)
      .toBe(fourth.milestone_id);
    expect(resolveCampaignAuthorization({
      rootDir, package: executionPackage(rootDir, fourth.milestone_id), timestamp: now,
    })).toMatchObject({ valid: true, approval: { approval_id: approval.approval_id } });
  });
});

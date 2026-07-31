import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createDefaultAgentRegistry } from "../../agents/registry";
import { artifactDigest } from "../../kernel";
import { createCodexProviderContract } from "../providers";
import { createExecutionAuthority } from "./builder";
import { issueExecutionAuthorization } from "./issuer";
import { loadExecutionAuthorityLedger } from "./ledger-store";
import { persistExecutionApproval } from "./approval-store";
import { persistExecutionAuthority } from "./store";
import { persistProviderExecutionAuthorization } from "./authorization-store";
import { formatReusableExecutionAuthority, resolveReusableExecutionAuthority } from "./reuse";

const timestamp = "2026-07-31T00:00:00.000Z";

function fixture() {
  const rootDir = mkdtempSync(path.join(tmpdir(), "pbos-authority-reuse-"));
  const contextBody = {
    context_id: "CONTEXT-001", repository_identity: "playbook-platform",
    commit_identity: "a".repeat(40), branch_identity: "main",
    manifest_digest: "b".repeat(64), artifact_digest: "c".repeat(64),
    architecture_digest: "d".repeat(64), governance_digest: "e".repeat(64),
    change_boundary_identity: "f".repeat(64), launch_approval_identity: "1".repeat(64),
    activation_decision_id: "DECISION-001", created_timestamp: timestamp,
    expiration_timestamp: "2026-08-02T00:00:00.000Z", created_by: "reviewer",
  };
  const context = { ...contextBody, digest: artifactDigest(contextBody) };
  const packageBody = {
    package_id: "PACKAGE-001", milestone_id: "MILESTONE-001", mission: "Execute.",
    context: ["context"], current_state: ["ready"], dependencies: [],
    required_changes: ["docs/output.md"], implementation_requirements: ["Implement."],
    security_requirements: ["Preserve governance."], validation_requirements: ["npm test"],
    documentation_requirements: ["docs/output.md"], completion_criteria: ["Pass."],
    human_approval_required: true as const, recommendation_digest: "2".repeat(64),
    timestamp,
  };
  const executionPackage = { ...packageBody, digest: artifactDigest(packageBody) };
  const approvalBody = {
    approval_id: "APPROVAL-001", request_id: "REQUEST-001",
    package_id: executionPackage.package_id, package_digest: executionPackage.digest,
    context_digest: context.digest, requested_by: "requester", approved_by: "reviewer",
    authority_type: "HUMAN", risk_level: "YELLOW" as const,
    scope: ["docs/output.md"], decision: "APPROVED" as const, timestamp,
    expiration: "2026-08-01T00:00:00.000Z",
  };
  const approval = { ...approvalBody, digest: artifactDigest(approvalBody) };
  const agent = createDefaultAgentRegistry(timestamp).get("PBOS-CODEX-CODE-001");
  if (!agent) throw new Error("Test agent is missing.");
  const providerBody = createCodexProviderContract({
    provider_id: agent.agent_id, version: agent.version,
  });
  const provider = { ...providerBody, digest: artifactDigest(providerBody) };
  const authority = createExecutionAuthority({
    context, package: executionPackage, packageCertificationDigest: "3".repeat(64),
    approval, agent, scope: ["docs/output.md"], blockedOperations: ["pbos/runtime"],
    requiredCapabilities: ["CODE_GENERATION"],
    evidenceRequirements: [...provider.evidence_contract], authorizationTime: timestamp,
    expirationTime: "2026-08-01T00:00:00.000Z",
  });
  const authorization = issueExecutionAuthorization({
    authority, context, package: executionPackage, provider,
    created_by: "requester", approved_by: "reviewer", issued_at: timestamp,
  });
  persistExecutionApproval(rootDir, approval);
  persistExecutionAuthority(rootDir, authority);
  persistProviderExecutionAuthorization(rootDir, authorization);
  return { rootDir, context, package: executionPackage, approval, authority, authorization, agent, provider };
}

function resolve(value: ReturnType<typeof fixture>, changes: Partial<Parameters<typeof resolveReusableExecutionAuthority>[0]> = {}) {
  return resolveReusableExecutionAuthority({
    rootDir: value.rootDir, context: value.context, package: value.package,
    provider: value.provider, agent: value.agent,
    expected_scope: value.package.required_changes,
    timestamp: "2026-07-31T01:00:00.000Z",
    ...changes,
  });
}

describe("execution authority reuse", () => {
  it("reuses a valid persisted authority chain and records its ledger correlation", () => {
    const value = fixture();
    const result = resolve(value);
    expect(result.valid).toBe(true);
    expect(result.authority?.approval.approval_id).toBe(value.approval.approval_id);
    expect(loadExecutionAuthorityLedger(value.rootDir)?.entries).toHaveLength(1);
    if (!result.authority) throw new Error("Reusable authority is missing.");
    expect(formatReusableExecutionAuthority(result.authority)).toContain(
      "PBOS EXISTING AUTHORITY FOUND\nApproval: APPROVAL-001\nRequester: requester\nReviewer: reviewer"
    );
  });

  it("rejects expired authority", () => {
    const value = fixture();
    expect(resolve(value, { timestamp: "2026-08-01T01:00:00.000Z" }).findings)
      .toContain("Execution authorization is expired.");
  });

  it("rejects a changed package digest", () => {
    const value = fixture();
    const changed = { ...value.package, digest: "4".repeat(64) };
    expect(resolve(value, { package: changed }).findings)
      .toContain("Execution package identity or digest changed.");
  });

  it("rejects a changed provider contract", () => {
    const value = fixture();
    const changed = { ...value.provider, digest: "5".repeat(64) };
    expect(resolve(value, { provider: changed }).findings)
      .toContain("Execution provider, contract, or assigned agent changed.");
  });

  it("rejects changed scope", () => {
    const value = fixture();
    expect(resolve(value, { expected_scope: ["docs/other.md"] }).findings)
      .toContain("Execution scope changed.");
  });
});

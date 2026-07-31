import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import {
  loadProviderExecutionAuthorization,
  persistProviderExecutionAuthorization,
} from "./authorization-store";
import type { ExecutionAuthorization } from "./types";

const roots: string[] = [];

function root(): string {
  const value = mkdtempSync(path.join(os.tmpdir(), "pbos-auth-store-"));
  roots.push(value);
  return value;
}

function currentAuthorization(): ExecutionAuthorization {
  const body = {
    authorization_id: "EXECUTION-AUTHORIZATION-NEW",
    package_id: "PACKAGE-001",
    package_digest: "a".repeat(64),
    repository_identity: "playbook-platform",
    branch_identity: "main",
    commit_identity: "b".repeat(40),
    context_digest: "c".repeat(64),
    provider_id: "PBOS-CODEX-CODE-001",
    provider_contract_id: "PROVIDER-CONTRACT-PBOS-CODEX-CODE-001-1.0.0",
    agent_id: "PBOS-CODEX-CODE-001",
    provider_contract_digest: "d".repeat(64),
    allowed_actions: ["docs/output.md"],
    prohibited_actions: ["pbos/runtime"],
    expiration: "2027-07-31T00:00:00.000Z",
    evidence_requirements: ["VALIDATION_RESULTS"],
    trusted_context_identity: "CONTEXT-001",
    created_by: "requester",
    approved_by: "reviewer",
    status: "AUTHORIZED" as const,
    issued_at: "2026-07-31T00:00:00.000Z",
  };
  return { ...body, digest: artifactDigest(body) };
}

afterEach(() => {
  for (const value of roots.splice(0)) rmSync(value, { recursive: true, force: true });
});

describe("provider execution authorization store", () => {
  it("preserves a legacy authorization as superseded history", () => {
    const rootDir = root();
    const legacyBody = {
      authorization_id: "EXECUTION-AUTHORIZATION-LEGACY",
      package_id: "PACKAGE-OLD",
      provider_id: "PBOS-CODEX-CODE-001",
    };
    const legacy = { ...legacyBody, digest: artifactDigest(legacyBody) };
    const envelopeBody = {
      owner: "execution-authorization-authority" as const,
      latest: legacy,
      history: [],
    };
    Runtime.save(
      path.join(rootDir, Artifacts.executionFabricAuthorization),
      { ...envelopeBody, digest: artifactDigest(envelopeBody) },
      "execution-authorization-authority"
    );

    expect(loadProviderExecutionAuthorization(rootDir)).toBeNull();
    const result = persistProviderExecutionAuthorization(
      rootDir,
      currentAuthorization()
    );
    expect(result.history).toContainEqual(legacy);
    expect(result.latest.authorization_id).toBe("EXECUTION-AUTHORIZATION-NEW");
  });
});

import { generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { artifactDigest } from "../kernel/identity";
import {
  buildContextRealitySnapshot,
  validateContextReality,
} from "../context/refresh";
import type { RepositoryContextSnapshot } from "../context";
import {
  admitExecution,
  ExecutionQueue,
  transitionExecution,
  type ExecutionLifecycle,
} from "../orchestration/execution-runtime";
import type { GovernedExecutionInput } from "../orchestration/execution";
import {
  CryptographicEvidenceRegistry,
  DurableEvidenceLedger,
  type EvidenceLedgerStorage,
  type TrustRecord,
} from ".";

const now = "2026-07-30T12:00:00.000Z";
const temporal = {
  effective_at: now,
  observed_at: now,
  recorded_at: now,
  superseded_at: null,
};

function repository(clean = true): RepositoryContextSnapshot {
  return {
    repositoryRoot: "/repo",
    remoteName: "origin",
    remoteUrl: "git@example/repo.git",
    repositoryIdentity: "playbook-platform",
    git: {
      branch: "main",
      commitSha: "a".repeat(40),
      upstream: "origin/main",
      ahead: 0,
      behind: 0,
      workingTreeClean: clean,
      workingTreeDigest: "b".repeat(64),
      workingTreeContentDigest: "c".repeat(64),
    },
    runtime: {
      engineVersion: "3.0.0",
      currentGate: null,
      completedGates: [],
      activeSprint: null,
      executionMode: "planning",
    },
    artifacts: [
      {
        path: "pbos/runtime/repository.json",
        exists: true,
        gateId: null,
        branch: "main",
        status: "PASS",
        generatedAt: now,
        digest: "d".repeat(64),
      },
    ],
  };
}

describe("PBOS autonomous operating foundation hardening", () => {
  it("rejects dirty context reality", () => {
    const value = buildContextRealitySnapshot({
      repository: repository(false),
      architecture_inventory: ["PBOS-CONSTITUTION"],
      governance_state: "VALID",
      captured_at: now,
    });
    expect(
      validateContextReality(value, {
        repository_identity: "playbook-platform",
        commit_identity: "a".repeat(40),
        branch: "main",
      })
    ).toEqual({
      valid: false,
      errors: ["Working tree is not committed."],
    });
  });

  it("verifies Ed25519 evidence and rejects alteration", () => {
    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    const digest = "e".repeat(64);
    const signature = sign(null, Buffer.from(digest, "utf8"), privateKey).toString(
      "base64"
    );
    const base = {
      identity: {
        id: "TRUST-001",
        version: "1",
        authority: "PBOS-CONSTITUTION",
        organization_scope: "PLAYBOOK",
      },
      digest,
      source: "docs/evidence.md",
      created_by: "ACTOR-001",
      temporal,
      provenance: ["SOURCE-001"],
      certificate: {
        id: "CERT-001",
        evidence_identity: {
          id: "TRUST-001",
          version: "1",
          authority: "PBOS-CONSTITUTION",
          organization_scope: "PLAYBOOK",
        },
        evidence_digest: digest,
        signature: {
          algorithm: "Ed25519" as const,
          key_id: "KEY-001",
          signature,
        },
        issuer_id: "VALIDATOR-001",
        issued_at: now,
        expires_at: "2099-01-01T00:00:00.000Z",
        revoked_at: null,
        lineage: [],
      },
      previous_record_digest: null,
      ledger_sequence: 1,
      record_digest: "",
    };
    const record: TrustRecord = {
      ...base,
      record_digest: artifactDigest({ ...base, record_digest: undefined }),
    };
    const registry = new CryptographicEvidenceRegistry([
      {
        id: "VALIDATOR-001",
        authority: "PBOS-VALIDATION",
        public_key_pem: publicKey.export({ format: "pem", type: "spki" }).toString(),
        active: true,
      },
    ]);
    const request = {
      id: "VERIFY-001",
      record,
      validator_id: "VALIDATOR-001",
      requested_at: now,
    };
    expect(registry.verify(request).verification.valid).toBe(true);
    expect(
      registry.verify({
        ...request,
        record: { ...record, digest: "f".repeat(64) },
      }).verification.valid
    ).toBe(false);
  });

  it("detects ledger chain alteration", () => {
    let records: readonly TrustRecord[] = [];
    const storage: EvidenceLedgerStorage = {
      load: () => records,
      save: (value) => {
        records = value;
      },
    };
    const ledger = new DurableEvidenceLedger(storage);
    const record = ledger.append({
      identity: {
        id: "TRUST-001",
        version: "1",
        authority: "PBOS-CONSTITUTION",
        organization_scope: "PLAYBOOK",
      },
      digest: "e".repeat(64),
      source: "docs/evidence.md",
      created_by: "ACTOR-001",
      temporal,
      provenance: ["SOURCE-001"],
      certificate: {
        id: "CERT-001",
        evidence_identity: {
          id: "TRUST-001",
          version: "1",
          authority: "PBOS-CONSTITUTION",
          organization_scope: "PLAYBOOK",
        },
        evidence_digest: "e".repeat(64),
        signature: {
          algorithm: "Ed25519",
          key_id: "KEY-001",
          signature: "external-signature",
        },
        issuer_id: "VALIDATOR-001",
        issued_at: now,
        expires_at: "2099-01-01T00:00:00.000Z",
        revoked_at: null,
        lineage: [],
      },
      previous_record_digest: null,
    });
    expect(ledger.verifyIntegrity()).toEqual([]);
    records = [{ ...record, source: "altered" }];
    expect(ledger.verifyIntegrity()).toContain("Ledger record 1 is altered.");
  });

  it("fails execution admission without trusted context", () => {
    const governed = {
      trusted_context: false,
      execution_package: {
        package_id: "",
        milestone_id: "",
        mission: "",
        context: [],
        current_state: [],
        dependencies: [],
        required_changes: [],
        implementation_requirements: [],
        security_requirements: [],
        validation_requirements: [],
        documentation_requirements: [],
        completion_criteria: [],
        human_approval_required: true,
        recommendation_digest: "",
        timestamp: now,
        digest: "",
      },
      authorization: {
        request: {} as never,
        decision: {} as never,
        valid: false,
        findings: [],
        digest: "",
      },
      dependencies_satisfied: false,
      validations_passing: false,
    } satisfies GovernedExecutionInput;
    const admission = admitExecution(
      {
        id: "EXECUTION-REQUEST-001",
        governed_input: governed,
        kernel_admission_digest: "",
        requested_by: "ACTOR-001",
        requested_at: now,
        evidence_capture_required: true,
        outcome_evaluation_required: true,
      },
      now
    );
    expect(admission.admitted).toBe(false);
    expect(admission.findings).toContain("Context is not trusted.");
  });

  it("rejects lifecycle jumps and duplicate queue identities", () => {
    const lifecycleBody: ExecutionLifecycle = {
      execution_id: "EXEC-001",
      request_id: "REQUEST-001",
      state: "REQUESTED",
      history: [],
      digest: "",
    };
    const lifecycle = {
      ...lifecycleBody,
      digest: artifactDigest({ ...lifecycleBody, digest: undefined }),
    };
    expect(() =>
      transitionExecution(lifecycle, "RUNNING", "ACTOR-001", "EVIDENCE-001", now)
    ).toThrow("rejected");

    const item = {
      request: {} as never,
      environment: {} as never,
      admission: null,
    };
    const queue = new ExecutionQueue().enqueue({
      ...item,
      request: { id: "REQUEST-001" } as never,
    });
    expect(() =>
      queue.enqueue({ ...item, request: { id: "REQUEST-001" } as never })
    ).toThrow("duplicate");
  });
});

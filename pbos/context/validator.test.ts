import { describe, expect, it } from "vitest";
import {
  Artifacts,
  PBOSConfig,
  RuntimeArtifactOwnership,
  artifactDigest,
} from "../kernel";
import type {
  RepositoryContextArtifact,
  RepositoryContextSnapshot,
} from "./schema";
import { REPOSITORY_CONTEXT_VERSION } from "./schema";
import { validateRepositoryContext } from "./validator";

const now = new Date("2026-07-28T12:00:00.000Z");

function snapshot(): RepositoryContextSnapshot {
  return {
    repositoryRoot: "/workspace/playbook-platform",
    remoteName: "origin",
    remoteUrl: PBOSConfig.repository.url,
    repositoryIdentity: "playbook-platform",
    git: {
      branch: "pbos/context",
      commitSha: "a".repeat(40),
      upstream: "origin/pbos/context",
      ahead: 0,
      behind: 0,
      workingTreeClean: true,
      workingTreeDigest: artifactDigest(""),
      workingTreeContentDigest: artifactDigest({
        trackedDiff: "",
        untrackedFiles: [],
      }),
    },
    runtime: {
      engineVersion: PBOSConfig.engineVersion,
      currentGate: "PBOS-CONTEXT-001",
      completedGates: ["PBOS-ENGINE-005"],
      activeSprint: "PBOS-CONTEXT-001",
      executionMode: "planning",
    },
    artifacts: [
      Artifacts.repository,
      Artifacts.planning,
      Artifacts.validation,
      Artifacts.execution,
      Artifacts.executionContract,
      Artifacts.workPackage,
      Artifacts.executionAuthorization,
    ].map((artifactPath) => ({
      path: artifactPath,
      exists: true,
      gateId:
        artifactPath === Artifacts.planning
          ? "PBOS-CONTEXT-001"
          : artifactPath === Artifacts.repository ||
              artifactPath === Artifacts.validation
            ? null
            : "PBOS-ENGINE-005",
      branch:
        artifactPath === Artifacts.repository
          ? "pbos/context"
          : null,
      status:
        artifactPath === Artifacts.validation ? "PASS" : null,
      generatedAt: "2026-07-28T11:00:00.000Z",
      digest: artifactDigest(artifactPath),
      owner: Object.values(RuntimeArtifactOwnership).find(
        ({ path }) => path === artifactPath
      )?.owner,
      consumers:
        Object.values(RuntimeArtifactOwnership).find(
          ({ path }) => path === artifactPath
        )?.consumers ?? [],
    })),
  };
}

function artifact(
  value = snapshot()
): RepositoryContextArtifact {
  return {
    version: REPOSITORY_CONTEXT_VERSION,
    capturedAt: "2026-07-28T11:30:00.000Z",
    snapshot: value,
    identity: artifactDigest(value),
  };
}

function validate(
  captured: RepositoryContextArtifact | undefined,
  observed = snapshot()
) {
  return validateRepositoryContext({
    artifact: captured,
    observed,
    expectedRoot: "/workspace/playbook-platform",
    now,
  });
}

describe("PBOS repository context validation", () => {
  it("accepts a current identity-consistent context", () => {
    expect(validate(artifact()).valid).toBe(true);
  });

  it("fails closed when the context artifact is missing", () => {
    expect(validate(undefined).errors).toContain(
      "Context validation failed: context artifact is missing."
    );
  });

  it("rejects an unknown repository identity", () => {
    const observed = snapshot();
    observed.repositoryIdentity = "unknown";

    expect(validate(artifact(), observed).errors).toContain(
      "Context validation failed: repository identity is unknown."
    );
  });

  it("rejects branch and upstream misalignment", () => {
    const observed = snapshot();
    observed.git.branch = "other";

    expect(validate(artifact(), observed).errors).toContain(
      "Context validation failed: branch does not match expected context."
    );
  });

  it("rejects a commit mismatch", () => {
    const observed = snapshot();
    observed.git.commitSha = "b".repeat(40);

    expect(validate(artifact(), observed).errors).toContain(
      "Context validation failed: commit identity mismatches."
    );
  });

  it("rejects changed content with unchanged Git status classification", () => {
    const observed = snapshot();
    observed.git.workingTreeContentDigest = artifactDigest(
      "changed file content"
    );

    expect(validate(artifact(), observed).errors).toContain(
      "Context validation failed: working tree state changed after capture."
    );
  });

  it("rejects conflicting runtime gates", () => {
    const observed = snapshot();
    observed.runtime.activeSprint = "PBOS-OTHER-001";

    expect(validate(artifact(), observed).errors).toContain(
      "Context validation failed: current gate and active sprint conflict."
    );
  });

  it("rejects a conflicting artifact gate", () => {
    const observed = snapshot();
    observed.artifacts[1].gateId = "PBOS-UNKNOWN-001";

    expect(validate(artifact(), observed).errors).toContain(
      `Context validation failed: artifact ${Artifacts.planning} references conflicting gate PBOS-UNKNOWN-001.`
    );
  });

  it("rejects a repository artifact from another branch", () => {
    const observed = snapshot();
    observed.artifacts[0].branch = "other";

    expect(validate(artifact(), observed).errors).toContain(
      "Context validation failed: repository artifact branch conflicts with Git."
    );
  });

  it("rejects a failed runtime validation artifact", () => {
    const observed = snapshot();
    observed.artifacts[2].status = "FAIL";

    expect(validate(artifact(), observed).errors).toContain(
      "Context validation failed: runtime validation artifact is not PASS."
    );
  });

  it("rejects stale context and runtime artifacts", () => {
    const observed = snapshot();
    observed.artifacts[0].generatedAt =
      "2026-07-20T00:00:00.000Z";
    const stale = artifact();
    stale.capturedAt = "2026-07-20T00:00:00.000Z";

    const result = validate(stale, observed);

    expect(result.errors).toContain(
      "Context validation failed: context artifact is stale."
    );
    expect(result.errors).toContain(
      `Context validation failed: required artifact is stale: ${Artifacts.repository}.`
    );
  });

  it("rejects context identity tampering", () => {
    const tampered = artifact();
    tampered.identity = "invalid";

    expect(validate(tampered).errors).toContain(
      "Context validation failed: context artifact identity is invalid."
    );
  });
});

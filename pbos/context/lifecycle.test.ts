import { describe, expect, it } from "vitest";
import {
  Artifacts,
  PBOSConfig,
  RuntimeArtifactOwnership,
  artifactDigest,
} from "../kernel";
import { certifyRepositoryContext } from "./certification";
import { buildRepositoryContextArtifact } from "./generator";
import {
  appendContextRefreshHistory,
  validateContextRefreshHistory,
} from "./history";
import type {
  ContextRefreshRecord,
  RepositoryContextSnapshot,
} from "./schema";
import { validateRepositoryContext } from "./validator";

const capturedAt = "2026-07-28T12:00:00.000Z";
const now = new Date(capturedAt);

function snapshot(commit = "a".repeat(40)): RepositoryContextSnapshot {
  return {
    repositoryRoot: "/workspace/playbook-platform",
    remoteName: "origin",
    remoteUrl: PBOSConfig.repository.url,
    repositoryIdentity: "playbook-platform",
    git: {
      branch: "pbos/context",
      commitSha: commit,
      upstream: "origin/pbos/context",
      ahead: 0,
      behind: 0,
      workingTreeClean: false,
      workingTreeDigest: artifactDigest(" M pbos/context/lifecycle.ts"),
      workingTreeContentDigest: artifactDigest({
        trackedDiff: "governed change",
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
    ].map((artifactPath) => {
      const governance = Object.values(
        RuntimeArtifactOwnership
      ).find(({ path }) => path === artifactPath);
      return {
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
        generatedAt: "2026-07-28T11:30:00.000Z",
        digest: artifactDigest(artifactPath),
        owner: governance?.owner ?? null,
        consumers: governance?.consumers ?? [],
      };
    }),
  };
}

function record(
  previousContextIdentity: string | null,
  newContextIdentity: string,
  timestamp = capturedAt
): ContextRefreshRecord {
  return {
    id: artifactDigest({
      previousContextIdentity,
      newContextIdentity,
      timestamp,
    }),
    previousContextIdentity,
    newContextIdentity,
    reason: "Repository changed through governed engineering work.",
    triggeringConditions: [
      "Context validation failed: commit identity mismatches.",
    ],
    timestamp,
    validator: {
      id: "PBOS-CONTEXT-VALIDATOR",
      version: "1.1.0",
    },
    generationResult: "PASS",
  };
}

describe("PBOS context lifecycle", () => {
  it("generates deterministic content-sensitive identities", () => {
    const observed = snapshot();
    const first = buildRepositoryContextArtifact(observed, capturedAt);
    const second = buildRepositoryContextArtifact(observed, capturedAt);
    const changed = buildRepositoryContextArtifact(
      snapshot("b".repeat(40)),
      capturedAt
    );

    expect(first).toEqual(second);
    expect(first.identity).not.toBe(changed.identity);
    expect(
      first.snapshot.artifacts.every(
        ({ owner, digest }) => Boolean(owner) && Boolean(digest)
      )
    ).toBe(true);
  });

  it("recertifies repository truth after an intentional commit", () => {
    const previousSnapshot = snapshot();
    const previous = buildRepositoryContextArtifact(
      previousSnapshot,
      capturedAt
    );
    const observed = snapshot("b".repeat(40));

    expect(
      validateRepositoryContext({
        artifact: previous,
        observed,
        expectedRoot: observed.repositoryRoot,
        now,
      }).valid
    ).toBe(false);

    const refreshed = buildRepositoryContextArtifact(
      observed,
      capturedAt
    );
    expect(
      certifyRepositoryContext({
        artifact: refreshed,
        observed,
        rootDir: observed.repositoryRoot,
        now,
      }).valid
    ).toBe(true);
  });

  it("rejects incomplete refresh candidates and invalid ownership", () => {
    const missing = snapshot();
    missing.artifacts[0].exists = false;
    const missingArtifact = buildRepositoryContextArtifact(
      missing,
      capturedAt
    );
    expect(
      certifyRepositoryContext({
        artifact: missingArtifact,
        observed: missing,
        rootDir: missing.repositoryRoot,
        now,
      }).valid
    ).toBe(false);

    const invalidOwner = snapshot();
    invalidOwner.artifacts[0].owner = "manual-owner";
    const invalidOwnerArtifact = buildRepositoryContextArtifact(
      invalidOwner,
      capturedAt
    );
    expect(
      certifyRepositoryContext({
        artifact: invalidOwnerArtifact,
        observed: invalidOwner,
        rootDir: invalidOwner.repositoryRoot,
        now,
      }).errors
    ).toContain(
      `Context validation failed: artifact ownership is invalid: ${Artifacts.repository}.`
    );
  });

  it("preserves refresh history and rejects manual latest mutation", () => {
    const first = record(null, "context-a");
    const second = record(
      "context-a",
      "context-b",
      "2026-07-28T12:01:00.000Z"
    );
    const history = appendContextRefreshHistory(
      appendContextRefreshHistory(null, first),
      second
    );

    expect(history.history).toHaveLength(2);
    expect(history.latest).toEqual(second);
    expect(() =>
      validateContextRefreshHistory({
        ...history,
        latest: first,
      })
    ).toThrow("history is invalid");
  });
});

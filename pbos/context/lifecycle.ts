import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../kernel";
import { certifyRepositoryContext } from "./certification";
import { buildRepositoryContextArtifact } from "./generator";
import { appendContextRefreshHistory } from "./history";
import {
  loadRepositoryContextArtifact,
} from "./loader";
import { observeRepositoryContext } from "./observer";
import { renderContextRefreshReport } from "./reports";
import {
  REPOSITORY_CONTEXT_VERSION,
  type ContextRefreshArtifact,
  type ContextRefreshRecord,
  type RepositoryContextArtifact,
} from "./schema";
import { validateRepositoryContext } from "./validator";

export interface ContextRefreshResult {
  context: RepositoryContextArtifact;
  refresh: ContextRefreshArtifact;
}

export function refreshRepositoryContext(options: {
  rootDir?: string;
  reason: string;
  now?: Date;
}): ContextRefreshResult {
  const rootDir = options.rootDir ?? process.cwd();
  const reason = options.reason.trim();
  if (!reason) {
    throw new Error("Context refresh reason is required.");
  }
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  const previous = loadRepositoryContextArtifact(rootDir);
  const observed = observeRepositoryContext(rootDir);
  const triggeringConditions = previous
    ? validateRepositoryContext({
        artifact: previous,
        observed,
        expectedRoot: rootDir,
        now,
      }).errors
    : ["Context artifact was missing."];
  const candidate = buildRepositoryContextArtifact(
    observed,
    timestamp
  );
  const certification = certifyRepositoryContext({
    artifact: candidate,
    observed,
    rootDir,
    now,
  });
  if (!certification.valid) {
    throw new Error(
      `Context refresh rejected:\n${certification.errors.join("\n")}`
    );
  }

  const record: ContextRefreshRecord = {
    id: artifactDigest({
      previousContextIdentity: previous?.identity ?? null,
      newContextIdentity: candidate.identity,
      reason,
      triggeringConditions,
      timestamp,
    }),
    previousContextIdentity: previous?.identity ?? null,
    newContextIdentity: candidate.identity,
    reason,
    triggeringConditions,
    timestamp,
    validator: {
      id: "PBOS-CONTEXT-VALIDATOR",
      version: REPOSITORY_CONTEXT_VERSION,
    },
    generationResult: "PASS",
  };
  const refreshPath = path.join(rootDir, Artifacts.contextRefresh);
  const existing = Runtime.exists(refreshPath)
    ? Runtime.load<ContextRefreshArtifact>(refreshPath)
    : null;
  const refresh = appendContextRefreshHistory(existing, record);

  Runtime.save(
    path.join(rootDir, Artifacts.repositoryContext),
    candidate,
    "repository-context"
  );
  Runtime.save(refreshPath, refresh, "repository-context");

  const reportDirectory = path.join(rootDir, "docs/release-evidence");
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    path.join(reportDirectory, "pbos-context-refresh.md"),
    renderContextRefreshReport(candidate, refresh),
    "utf8"
  );
  return { context: candidate, refresh };
}

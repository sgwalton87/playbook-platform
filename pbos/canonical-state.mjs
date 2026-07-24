import { readFile } from "node:fs/promises";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

export const CANONICAL_DOCUMENTS = Object.freeze([
  "repository-state.yaml",
  "repository-health.yaml",
  "repository-topology.yaml",
  "engineering-gates.yaml",
  "validation-baseline.yaml",
]);

export class CanonicalStateError extends Error {
  constructor(issues) {
    const lines = issues.map(({ file, reason }) => `- docs/PBOS/${file}: ${reason}`);
    super(["PBOS_CANONICAL_STATE_UNAVAILABLE", ...lines].join("\n"));
    this.name = "CanonicalStateError";
    this.code = "PBOS_CANONICAL_STATE_UNAVAILABLE";
    this.issues = issues;
  }
}

export async function loadCanonicalState(repositoryRoot) {
  const directory = path.join(repositoryRoot, "docs", "PBOS");
  const entries = await Promise.all(CANONICAL_DOCUMENTS.map(async (file) => {
    try {
      const source = await readFile(path.join(directory, file), "utf8");
      const value = parseYaml(source);
      if (value === undefined || value === null || typeof value !== "object") {
        throw new Error("document root must be a mapping or sequence");
      }
      return [file, value];
    } catch (error) {
      const reason = error?.code === "ENOENT"
        ? "missing"
        : `invalid YAML (${error instanceof Error ? error.message : String(error)})`;
      return { file, reason };
    }
  }));

  const issues = entries.filter((entry) => !Array.isArray(entry));
  if (issues.length > 0) throw new CanonicalStateError(issues);
  return Object.fromEntries(entries);
}

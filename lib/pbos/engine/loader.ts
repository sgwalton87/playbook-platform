import { readFile } from "node:fs/promises";
import path from "node:path";
import { load } from "js-yaml";

import { CANONICAL_FILES, type CanonicalFile, type PbosState } from "./types";

export class PbosLoadError extends Error {
  constructor(public readonly file: CanonicalFile, message: string, options?: ErrorOptions) {
    super(`Unable to load PBOS canonical input ${file}: ${message}`, options);
    this.name = "PbosLoadError";
  }
}

export async function loadPbosState(repositoryRoot: string): Promise<PbosState> {
  const documents = await Promise.all(CANONICAL_FILES.map((file) => loadYaml(repositoryRoot, file)));

  return {
    repositoryState: documents[0] as PbosState["repositoryState"],
    repositoryHealth: documents[1] as PbosState["repositoryHealth"],
    repositoryTopology: documents[2] as PbosState["repositoryTopology"],
    engineeringGates: documents[3] as PbosState["engineeringGates"],
    validationBaseline: documents[4] as PbosState["validationBaseline"],
  };
}

async function loadYaml(repositoryRoot: string, file: CanonicalFile): Promise<unknown> {
  const filePath = path.join(repositoryRoot, "docs", "PBOS", file);
  let source: string;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    throw new PbosLoadError(file, "file is missing or unreadable", { cause: error });
  }

  try {
    const value = load(source);
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("document root must be a mapping");
    }
    return value;
  } catch (error) {
    throw new PbosLoadError(file, error instanceof Error ? error.message : "invalid YAML", {
      cause: error,
    });
  }
}

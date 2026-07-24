import { readFile } from "node:fs/promises";
import type { PbosConfig, ValidationResult } from "./types";

interface PromptManifestEntry {
  name: string;
  version: string;
  compatibleEngineVersion: string;
  minimumHandbookVersion: string;
  status: "active" | "historic" | "deprecated";
  lastUpdated: string;
  owningSubsystem: string;
  path: string;
}

interface PromptManifest {
  prompts: PromptManifestEntry[];
}

export async function verifyPromptCompatibility(config: PbosConfig, rootDir = process.cwd()): Promise<ValidationResult> {
  const manifestPath = `${rootDir}/pbos/prompts/manifest.json`;
  try {
    const raw = await readFile(manifestPath, "utf8");
    const manifest = JSON.parse(raw) as PromptManifest;
    const active = manifest.prompts.find((prompt) => prompt.status === "active");
    if (!active) {
      return {
        id: "PromptCompatibility",
        severity: "error",
        passed: false,
        message: "No active PBOS prompt is registered.",
        remediation: "Add an active prompt to pbos/prompts/manifest.json.",
        handbookReference: "pbos/README.md#authority-hierarchy",
      };
    }
    const passed = active.compatibleEngineVersion === config.version;
    return {
      id: "PromptCompatibility",
      severity: passed ? "info" : "error",
      passed,
      message: passed
        ? `Active prompt ${active.name} is compatible with PBOS Engine ${config.version}.`
        : `Active prompt ${active.name} expects PBOS Engine ${active.compatibleEngineVersion}, but config is ${config.version}.`,
      remediation: passed ? "No remediation required." : "Upgrade the prompt or engine version before continuing.",
      handbookReference: "pbos/README.md#execution-modes",
    };
  } catch (error) {
    return {
      id: "PromptCompatibility",
      severity: "error",
      passed: false,
      message: `Prompt manifest could not be read: ${error instanceof Error ? error.message : String(error)}`,
      remediation: "Restore pbos/prompts/manifest.json before running PBOS.",
      handbookReference: "pbos/README.md#authority-hierarchy",
    };
  }
}

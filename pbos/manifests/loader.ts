import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { artifactDigest } from "../kernel/identity";
import {
  BUILD_MILESTONE_STATES,
  type BuildMilestone,
  type LoadedBuildManifest,
  type PlaybookMasterBuildManifest,
} from "./types";

const REQUIRED_DOMAINS = [
  "applications",
  "engines",
  "features",
  "infrastructure",
  "integrations",
  "launch",
  "operating-systems",
  "platform",
  "security",
] as const;

function strings(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0);
}

function assertMilestone(value: unknown, ids: Set<string>): asserts value is BuildMilestone {
  if (!value || typeof value !== "object") throw new Error("Build milestone must be an object.");
  const item = value as Record<string, unknown>;
  const requiredStrings = ["id", "name", "type", "description", "domain", "owner", "version"] as const;
  const requiredLists = [
    "dependencies", "blocking_dependencies", "required_artifacts", "required_capabilities",
    "validation_requirements", "completion_definition", "evidence_requirements", "outputs",
  ] as const;
  if (requiredStrings.some((key) => typeof item[key] !== "string" || item[key] === "")) {
    throw new Error("Build milestone identity and ownership fields are required.");
  }
  if (requiredLists.some((key) => !strings(item[key]))) {
    throw new Error(`Build milestone ${String(item.id)} has invalid contract lists.`);
  }
  if (
    !BUILD_MILESTONE_STATES.includes(item.status as never) ||
    !["PROGRAM", "MILESTONE", "OPERATING_SYSTEM", "APPLICATION", "ENGINE", "FEATURE", "COMPONENT", "INFRASTRUCTURE", "INTEGRATION", "SECURITY_CONTROL"].includes(String(item.type)) ||
    !["GREEN", "YELLOW", "RED"].includes(String(item.risk_level)) ||
    !["POLICY", "HUMAN", "EXPLICIT_HUMAN"].includes(String(item.approval_level)) ||
    typeof item.priority !== "number" ||
    item.priority < 0 ||
    item.priority > 100
  ) {
    throw new Error(`Build milestone ${String(item.id)} has invalid governance metadata.`);
  }
  if (ids.has(String(item.id))) throw new Error(`Duplicate build milestone ${String(item.id)}.`);
  if (item.mission_control !== undefined) {
    const mission = item.mission_control as Record<string, unknown>;
    const completed = mission.completed;
    const generating = mission.generating;
    if (
      !mission ||
      typeof mission !== "object" ||
      typeof mission.objective !== "string" ||
      !mission.objective ||
      typeof mission.phase !== "string" ||
      !mission.phase ||
      typeof mission.next_human_decision !== "string" ||
      !mission.next_human_decision ||
      !Array.isArray(completed) ||
      completed.length === 0 ||
      !completed.every((entry) => {
        const record = entry as Record<string, unknown>;
        return typeof record.label === "string" && record.label.length > 0 && strings(record.evidence);
      }) ||
      !Array.isArray(generating) ||
      generating.length === 0 ||
      !generating.every((entry) => {
        const record = entry as Record<string, unknown>;
        return typeof record.label === "string" && record.label.length > 0 &&
          typeof record.output === "string" && record.output.length > 0;
      })
    ) {
      throw new Error(`Build milestone ${String(item.id)} has invalid Mission Control metadata.`);
    }
    const outputs = item.outputs as readonly string[];
    for (const entry of generating as Array<Record<string, unknown>>) {
      if (!outputs.includes(String(entry.output))) {
        throw new Error(`Build milestone ${String(item.id)} Mission Control output is undeclared.`);
      }
    }
  }
  ids.add(String(item.id));
}

export function loadMasterBuildManifest(rootDir = process.cwd()): LoadedBuildManifest {
  const path = resolve(rootDir, "pbos/manifests/playbook-master-manifest.yaml");
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error: unknown) {
    throw new Error(`Master build manifest is unreadable: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!parsed || typeof parsed !== "object") throw new Error("Master build manifest must be an object.");
  const value = parsed as Record<string, unknown>;
  if (
    value.manifest_id !== "PLAYBOOK-MASTER-MANIFEST" ||
    value.authority !== "PBOS-KERNEL" ||
    value.program !== "Playbook Platform" ||
    typeof value.version !== "string" ||
    !strings(value.domains) ||
    !Array.isArray(value.milestones)
  ) {
    throw new Error("Master build manifest identity is invalid.");
  }
  for (const domain of REQUIRED_DOMAINS) {
    if (!value.domains.includes(domain)) throw new Error(`Master build manifest domain missing: ${domain}.`);
  }
  const ids = new Set<string>();
  value.milestones.forEach((milestone) => assertMilestone(milestone, ids));
  for (const milestone of value.milestones as BuildMilestone[]) {
    for (const dependency of [...milestone.dependencies, ...milestone.blocking_dependencies]) {
      if (!ids.has(dependency)) throw new Error(`${milestone.id} references unknown dependency ${dependency}.`);
    }
  }
  const manifest = parsed as PlaybookMasterBuildManifest;
  return { path, manifest, digest: artifactDigest(manifest) };
}

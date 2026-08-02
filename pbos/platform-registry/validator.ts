import { loadMasterBuildManifest } from "../manifests";
import { buildPlatformRegistry, repositoryArtifactExists } from "./registry";
import { PLATFORM_RESOURCE_KINDS, PLATFORM_RESOURCE_STATUSES, type PlatformResourceKind, type RegistryValidationResult } from "./types";

export function validatePlatformRegistry(): RegistryValidationResult {
  const registry = buildPlatformRegistry();
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const milestoneIds = new Set(loadMasterBuildManifest().manifest.milestones.map(({ id }) => id));
  const counts = Object.fromEntries(PLATFORM_RESOURCE_KINDS.map((kind) => [kind, 0])) as Record<PlatformResourceKind, number>;

  for (const resource of registry.resources) {
    counts[resource.kind] += 1;
    if (!resource.id || ids.has(resource.id)) errors.push(`Duplicate or empty resource identifier: ${resource.id}.`);
    ids.add(resource.id);
    if (!PLATFORM_RESOURCE_KINDS.includes(resource.kind)) errors.push(`${resource.id} has invalid kind.`);
    if (!PLATFORM_RESOURCE_STATUSES.includes(resource.status)) errors.push(`${resource.id} has invalid status.`);
    if (!resource.purpose || !resource.owner) errors.push(`${resource.id} must declare purpose and owner.`);
    if (resource.definition_of_done.length === 0) errors.push(`${resource.id} has no definition of done.`);
    if (resource.evidence.length === 0) errors.push(`${resource.id} has no evidence.`);
    for (const evidence of resource.evidence) {
      if (!repositoryArtifactExists(evidence)) errors.push(`${resource.id} evidence does not exist: ${evidence}.`);
    }
    if (resource.kind === "DATABASE_ENTITY" && !resource.access) errors.push(`${resource.id} has no access contract.`);
    if (resource.kind === "OPERATING_SYSTEM" && !resource.operating_system) errors.push(`${resource.id} has no operating-system contract.`);
  }

  for (const resource of registry.resources) {
    for (const dependency of resource.dependencies) {
      if (!ids.has(dependency) && !milestoneIds.has(dependency)) errors.push(`${resource.id} references unknown dependency ${dependency}.`);
    }
    if (resource.status === "IMPLEMENTED") warnings.push(`${resource.id} claims implementation and still requires independent certification.`);
  }

  return { valid: errors.length === 0, errors: errors.sort(), warnings: warnings.sort(), counts };
}

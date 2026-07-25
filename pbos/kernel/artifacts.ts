/**
 * Canonical runtime artifact locations.
 *
 * Every PBOS engine should reference these constants instead of
 * hardcoding runtime file paths.
 */
export const Artifacts = {
  repository: "pbos/runtime/repository.json",
  planning: "pbos/runtime/next-gate.json",
  validation: "pbos/runtime/validation.json",
  execution: "pbos/runtime/execution.json",
  workflow: "pbos/runtime/workflow.json",
  doctor: "pbos/runtime/doctor.json",
  manifest: "pbos/runtime/manifest.json",
} as const;

export type ArtifactName = keyof typeof Artifacts;

/**
 * Resolve an artifact name to its runtime path.
 */
export function artifactPath(name: ArtifactName): string {
  return Artifacts[name];
}

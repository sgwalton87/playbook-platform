export const PBOS_SYSTEM_MANAGED_PATHS = [
  "pbos/runtime/",
  "docs/release-evidence/",
] as const;

export function isPBOSSystemManagedArtifact(path: string): boolean {
  return PBOS_SYSTEM_MANAGED_PATHS.some((prefix) =>
    path.startsWith(prefix)
  );
}

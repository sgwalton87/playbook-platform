import { join } from "path";

/**
 * Canonical PBOS filesystem paths.
 *
 * Engines should reference these constants rather than hardcoding
 * directory or file locations.
 */

const ROOT = process.cwd();

export const Paths = {
  root: ROOT,

  pbos: join(ROOT, "pbos"),

  runtime: join(ROOT, "pbos", "runtime"),

  kernel: join(ROOT, "pbos", "kernel"),

  commands: join(ROOT, "pbos", "commands"),

  registry: join(ROOT, "pbos", "registry"),

  workflow: join(ROOT, "pbos", "workflow"),

  execution: join(ROOT, "pbos", "execution"),

  planning: join(ROOT, "pbos", "planning"),

  validator: join(ROOT, "pbos", "validator"),
} as const;

/**
 * Join additional path segments onto the repository root.
 */
export function resolvePath(...segments: string[]): string {
  return join(ROOT, ...segments);
}

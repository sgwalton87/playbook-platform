import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { RuntimeArtifactOwnership } from "./artifact-ownership";

function runtimeGovernance(path: string) {
  const normalized = path.replaceAll("\\", "/");
  const governance = Object.values(RuntimeArtifactOwnership).find(
    ({ path: artifactPath }) =>
      normalized === artifactPath ||
      normalized.endsWith(`/${artifactPath}`)
  );

  if (
    !governance &&
    (normalized.startsWith("pbos/runtime/") ||
      normalized.includes("/pbos/runtime/"))
  ) {
    throw new Error(
      `Runtime artifact ownership is not registered: ${path}`
    );
  }

  return governance;
}

export class Runtime {
  /**
   * Read a runtime JSON artifact.
   */
  static load<T>(path: string): T {
    runtimeGovernance(path);
    if (!existsSync(path)) {
      throw new Error(`Runtime artifact not found: ${path}`);
    }

    return JSON.parse(readFileSync(path, "utf8")) as T;
  }

  /**
   * Write a runtime JSON artifact.
   */
  static save(path: string, data: unknown, owner?: string): void {
    const governance = runtimeGovernance(path);
    if (governance && governance.owner !== owner) {
      throw new Error(
        `Runtime artifact write denied: ${path} is owned by ${governance.owner}.`
      );
    }
    mkdirSync(dirname(path), { recursive: true });

    writeFileSync(
      path,
      JSON.stringify(data, null, 2),
      "utf8"
    );
  }

  /**
   * Determine whether a runtime artifact exists.
   */
  static exists(path: string): boolean {
    runtimeGovernance(path);
    return existsSync(path);
  }

  /**
   * Convenience helper to read or return a fallback value.
   */
  static loadOrDefault<T>(path: string, fallback: T): T {
    if (!existsSync(path)) {
      return fallback;
    }

    return this.load<T>(path);
  }
}

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { RuntimeArtifactOwnership } from "./artifact-ownership";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | { readonly [key: string]: JsonValue }
  | readonly JsonValue[];

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value !== "object") return false;
  return Object.values(value).every(isJsonValue);
}

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
  static load(path: string): JsonValue {
    runtimeGovernance(path);
    if (!existsSync(path)) {
      throw new Error(`Runtime artifact not found: ${path}`);
    }
    const value: unknown = JSON.parse(readFileSync(path, "utf8"));
    if (!isJsonValue(value)) {
      throw new Error(`Runtime artifact is not valid JSON data: ${path}`);
    }
    return value;
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
}

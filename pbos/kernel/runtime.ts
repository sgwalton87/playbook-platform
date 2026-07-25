import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";

export class Runtime {
  /**
   * Read a runtime JSON artifact.
   */
  static load<T>(path: string): T {
    if (!existsSync(path)) {
      throw new Error(`Runtime artifact not found: ${path}`);
    }

    return JSON.parse(readFileSync(path, "utf8")) as T;
  }

  /**
   * Write a runtime JSON artifact.
   */
  static save(path: string, data: unknown): void {
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

import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  Runtime,
  RuntimeArtifactOwnership,
} from "../kernel";

export class PbosRuntimeTestHarness {
  readonly rootDir: string;

  constructor(prefix = "pbos-runtime-test-") {
    this.rootDir = mkdtempSync(path.join(tmpdir(), prefix));
  }

  resolve(relativePath: string): string {
    const absolutePath = path.resolve(this.rootDir, relativePath);
    const relative = path.relative(this.rootDir, absolutePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(
        `Runtime test path escapes isolated root: ${relativePath}`
      );
    }
    return absolutePath;
  }

  save(relativePath: string, value: unknown): void {
    const governance = Object.values(
      RuntimeArtifactOwnership
    ).find(({ path: artifactPath }) => artifactPath === relativePath);
    if (!governance) {
      throw new Error(
        `Test fixture has no registered runtime owner: ${relativePath}`
      );
    }
    Runtime.save(
      this.resolve(relativePath),
      value,
      governance.owner
    );
  }

  load<T>(relativePath: string): T {
    return Runtime.load<T>(this.resolve(relativePath));
  }

  readText(relativePath: string): string {
    return readFileSync(this.resolve(relativePath), "utf8");
  }

  exists(relativePath: string): boolean {
    return existsSync(this.resolve(relativePath));
  }

  remove(relativePath: string): void {
    rmSync(this.resolve(relativePath), { force: true });
  }

  cleanup(): void {
    rmSync(this.rootDir, { recursive: true, force: true });
  }
}

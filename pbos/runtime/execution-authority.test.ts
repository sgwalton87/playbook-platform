import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function productionTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return productionTypeScriptFiles(entryPath);
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")
      ? [entryPath]
      : [];
  });
}

describe("PBOS execution authority", () => {
  const rootDir = process.cwd();
  const pbosDir = path.join(rootDir, "pbos");

  it("allows only the canonical runtime to invoke the execution engine", () => {
    const callers = productionTypeScriptFiles(pbosDir)
      .filter(
        (file) =>
          file !== path.join(pbosDir, "execution", "index.ts") &&
          file !== path.join(pbosDir, "execution", "dispatch.ts")
      )
      .filter((file) =>
        readFileSync(file, "utf8").includes("runExecutionEngine(")
      )
      .map((file) => path.relative(rootDir, file));

    expect(callers).toEqual(["pbos/runtime/kernel-runtime.ts"]);
  });

  it("keeps adapter dispatch behind the execution engine", () => {
    const callers = productionTypeScriptFiles(pbosDir)
      .filter(
        (file) =>
          file !== path.join(pbosDir, "execution", "index.ts") &&
          file !== path.join(pbosDir, "execution", "dispatch.ts")
      )
      .filter((file) =>
        readFileSync(file, "utf8").includes("dispatchExecutionAdapter")
      );

    expect(callers).toEqual([]);
  });

  it("does not restore retired runtime authority components", () => {
    const retired = [
      "pbos/runtime/runtime-manager.ts",
      "pbos/runtime/runtime-registry.ts",
      "pbos/runtime/runtime-factory.ts",
      "pbos/runtime/phase-runner.ts",
      "pbos/runtime/kernel-runtime-adapter.ts",
      "pbos/kernel/bootstrap/runtime-bootstrap.ts",
      "pbos/kernel/engine/execution-engine.ts",
    ];

    expect(
      retired.filter((relativePath) =>
        existsSync(path.join(rootDir, relativePath))
      )
    ).toEqual([]);
  });
});

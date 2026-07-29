import type { ValidationAdapter } from "../release";
import { createValidationAdapter } from "./adapter";
import { runNpmScript } from "./command-runner";

const scripts: Record<string, { script: string; name: string }> = {
  "pbos:lint": {
    script: "lint",
    name: "PBOS Declared Lint Validation",
  },
  "pbos:test": {
    script: "test",
    name: "PBOS Declared Test Validation",
  },
};

export function createGateValidationAdapters(
  requirements: string[],
  rootDir = process.cwd()
): ValidationAdapter[] {
  return requirements.map((requirement) => {
    const configured = scripts[requirement];
    return createValidationAdapter({
      id: requirement,
      name: configured?.name ?? `Unsupported ${requirement}`,
      async check() {
        if (!configured) {
          return {
            status: "FAIL",
            summary: `No canonical validation adapter is registered for ${requirement}.`,
            evidence: [],
          };
        }
        const result = await runNpmScript(configured.script, {
          cwd: rootDir,
        });
        return {
          status: result.success ? "PASS" : "FAIL",
          summary: result.success
            ? `${requirement} passed.`
            : `${requirement} failed.`,
          durationMs: result.durationMs,
          evidence: [
            `Exit Code: ${result.exitCode}`,
            result.stdout,
            result.stderr,
          ].filter(Boolean),
        };
      },
    });
  });
}

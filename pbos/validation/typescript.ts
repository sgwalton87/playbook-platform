import { createValidationAdapter } from "./adapter";
import { runTypeScript } from "./command-runner";

export const typeScriptValidationAdapter =
  createValidationAdapter({
    id: "typescript",
    name: "TypeScript Compilation",

    async check() {
      const result = await runTypeScript();

      return {
        status: result.success ? "PASS" : "FAIL",

        summary: result.success
          ? "TypeScript compilation passed."
          : "TypeScript compilation failed.",

        durationMs: result.durationMs,

        evidence: [
          `Exit Code: ${result.exitCode}`,
          ...(result.stdout
            ? result.stdout.split("\n")
            : []),
          ...(result.stderr
            ? result.stderr.split("\n")
            : []),
        ],
      };
    },
  });

export default typeScriptValidationAdapter;

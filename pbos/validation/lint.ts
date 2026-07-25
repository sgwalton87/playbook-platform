import { createValidationAdapter } from "./adapter";
import { runNpmScript } from "./command-runner";

export const lintValidationAdapter =
  createValidationAdapter({
    id: "lint",
    name: "Repository Lint",

    async check() {
      const result = await runNpmScript("lint");

      return {
        status: result.success ? "PASS" : "FAIL",

        summary: result.success
          ? "Repository lint passed."
          : "Repository lint failed.",

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

export default lintValidationAdapter;

import { createValidationAdapter } from "./adapter";
import { runNpmScript } from "./command-runner";

export const buildValidationAdapter =
  createValidationAdapter({
    id: "build",
    name: "Production Build",

    async check() {
      const result = await runNpmScript("build");

      return {
        status: result.success ? "PASS" : "FAIL",

        summary: result.success
          ? "Production build completed successfully."
          : "Production build failed.",

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

export default buildValidationAdapter;

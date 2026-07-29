import { loadValidationContext } from "./load";
import { runChecks } from "./checks";
import { ValidationResult } from "./types";

export function runRuntimeValidator(
  rootDir = process.cwd()
): ValidationResult {

    const ctx = loadValidationContext(rootDir);

    const checks = runChecks(ctx);

    const passed = checks.every(c => c.status === "PASS");

    return {

        status: passed ? "PASS" : "FAIL",

        selectedGate: ctx.planning?.selectedGate?.id ?? null,
        checks

    };

}

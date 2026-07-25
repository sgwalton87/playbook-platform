import { writeFileSync } from "node:fs";
import { runRuntimeValidator } from "../validator";

export function runValidator() {

    const result = runRuntimeValidator();

    writeFileSync(
        "pbos/runtime/validation.json",
        JSON.stringify(result, null, 2)
    );

    console.log("");
    console.log("PBOS Runtime Validator");
    console.log("----------------------");

    for (const check of result.checks) {
        console.log(
            `${check.name.padEnd(24, ".")} ${check.status}`
        );
    }

    console.log("");
    console.log(`Validation: ${result.status}`);
    console.log("");
    console.log("Runtime model written:");
    console.log("pbos/runtime/validation.json");
}

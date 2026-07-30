#!/usr/bin/env tsx
import { FounderOperatingLoop } from "../../autonomous";
import { formatItCommand } from "./format";

new FounderOperatingLoop()
  .run()
  .then((result) => {
    console.log(formatItCommand(result));
    if (result.readiness === "BLOCKED") process.exitCode = 1;
  })
  .catch((error: unknown) => {
    console.error(
      [
        "PLAYBOOK OS",
        "RUN IT",
        "System readiness: BLOCKED",
        `Reason: ${error instanceof Error ? error.message : String(error)}`,
        "No action was executed.",
      ].join("\n")
    );
    process.exitCode = 1;
  });

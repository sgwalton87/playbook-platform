#!/usr/bin/env tsx
import {
  dispatchKernelCommand,
  isKernelCommand,
} from "./kernel-command-bus";
import { readFounderEvidenceInput } from "./founder-evidence-input";
import { createChangeInventory } from "../context/change-boundary";

const requested = process.argv[2] ?? "next";

if (!isKernelCommand(requested)) {
  console.error(`Unknown PBOS kernel command '${requested}'.`);
  process.exitCode = 1;
} else {
  readFounderEvidenceInput({
    command: requested,
    args: process.argv.slice(3),
    interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    baselineAvailable:
      (requested === "change-boundary" || requested === "transition") &&
      createChangeInventory(process.cwd()).changes.length === 0,
  })
    .then((input) =>
      dispatchKernelCommand(
        requested,
        process.cwd(),
        process.env.PBOS_ACTOR_ID ?? "",
        input
      )
    )
    .then((result) => {
      console.log(result.output);
      if (!result.successful) process.exitCode = 1;
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}

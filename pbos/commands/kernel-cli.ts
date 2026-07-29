#!/usr/bin/env tsx
import {
  dispatchKernelCommand,
  isKernelCommand,
} from "./kernel-command-bus";

const requested = process.argv[2] ?? "next";

if (!isKernelCommand(requested)) {
  console.error(`Unknown PBOS kernel command '${requested}'.`);
  process.exitCode = 1;
} else {
  dispatchKernelCommand(requested)
    .then((result) => {
      console.log(result.output);
      if (!result.successful) process.exitCode = 1;
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}

#!/usr/bin/env tsx
import { dispatchKernelCommand } from "./kernel-command-bus";

dispatchKernelCommand("next")
  .then((result) => {
    console.log(result.output);
    if (!result.successful) process.exitCode = 1;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });

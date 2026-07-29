#!/usr/bin/env tsx
import { dispatchKernelCommand } from "./kernel-command-bus";

async function main(): Promise<void> {
  const result = await dispatchKernelCommand("status");
  console.log(result.output);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

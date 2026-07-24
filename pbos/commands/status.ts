#!/usr/bin/env tsx
import { CommandRegistry } from "./registry/command-registry";
import { formatEngineHealth, getEngineHealth } from "../health/engine-health";

async function main(): Promise<void> {
  const health = await getEngineHealth();
  const commands = new CommandRegistry().all();
  console.log(formatEngineHealth(health));
  console.log("Commands:");
  for (const command of commands) {
    console.log(`- ${command.name}: ${command.status} (${command.mode}) — ${command.description}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

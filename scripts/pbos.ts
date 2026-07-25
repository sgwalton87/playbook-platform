import { resolve } from "node:path";

import { runPbosEngine } from "../lib/pbos/engine";

type Command = "status" | "next" | "report";

async function main(): Promise<void> {
  const command = process.argv[2] as Command | undefined;
  if (!command || !["status", "next", "report"].includes(command)) {
    throw new Error("Usage: npm run pbos -- <status|next|report>");
  }

  const report = await runPbosEngine(resolve(process.cwd()));
  const output =
    command === "status"
      ? {
          repositoryStatus: report.repositoryStatus,
          currentGate: report.currentGate,
          currentHealth: report.currentHealth,
          currentBlockers: report.currentBlockers,
        }
      : command === "next"
        ? report.recommendedSprint
        : report;

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

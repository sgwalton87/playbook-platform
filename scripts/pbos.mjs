#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CanonicalStateError, loadCanonicalState } from "../pbos/canonical-state.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const command = process.argv[2];

if (!new Set(["status", "next", "report"]).has(command)) {
  console.error("Usage: npm run pbos -- <status|next|report>");
  process.exitCode = 2;
} else {
  try {
    await loadCanonicalState(repositoryRoot);
    // This checkout contains no PBOS command engine. Do not manufacture an answer
    // from documents whose command contracts are unavailable.
    console.error(`PBOS_ENGINE_UNAVAILABLE: cannot execute '${command}'; no PBOS engine implementation is tracked in this checkout.`);
    process.exitCode = 1;
  } catch (error) {
    if (error instanceof CanonicalStateError) {
      console.error(error.message);
      process.exitCode = 1;
    } else {
      throw error;
    }
  }
}

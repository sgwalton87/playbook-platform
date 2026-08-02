#!/usr/bin/env tsx
import {
  dispatchKernelCommand,
  isKernelCommand,
} from "./kernel-command-bus";
import { readFounderEvidenceInput } from "./founder-evidence-input";
import { createChangeInventory } from "../context/change-boundary";
import { loadTransitionLifecycle, validateTransitionScope } from "../transition";

const requested = process.argv[2] ?? "next";

async function main(): Promise<void> {
  if (!isKernelCommand(requested)) {
    throw new Error(`Unknown PBOS kernel command '${requested}'.`);
  }
  const rootDir = process.cwd();
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  let lifecycle = loadTransitionLifecycle(rootDir)?.latest ?? null;

  const transitionScopeChanged = Boolean(
    lifecycle && validateTransitionScope(
      lifecycle,
      createChangeInventory(rootDir),
      new Date().toISOString()
    ).some((finding) => finding.includes("scope changed"))
  );
  if (requested === "transition" && interactive && (!lifecycle || transitionScopeChanged)) {
    const preview = await dispatchKernelCommand(
      requested,
      rootDir,
      process.env.PBOS_ACTOR_ID ?? "",
      {}
    );
    console.log(preview.output);
    lifecycle = loadTransitionLifecycle(rootDir)?.latest ?? null;
  }

  const transitionApprovalPending =
    requested === "approve" && lifecycle?.state === "REQUESTER_APPROVED";
  const requesterApprovalPending =
    requested === "transition" && lifecycle?.state === "PROPOSED";
  const input = await readFounderEvidenceInput({
    command: requested,
    args: process.argv.slice(3),
    interactive: interactive && (requested !== "transition" || requesterApprovalPending),
    baselineAvailable:
      (requested === "change-boundary" || requested === "transition") &&
      createChangeInventory(rootDir).changes.length === 0,
    transitionApprovalPending,
  });
  const result = await dispatchKernelCommand(
    requested,
    rootDir,
    process.env.PBOS_ACTOR_ID ?? "",
    input
  );
  console.log(result.output);
  if (!result.successful) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

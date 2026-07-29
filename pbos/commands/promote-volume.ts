#!/usr/bin/env tsx

import {
  constitutionalVolumeLifecycles,
  promoteConstitutionalVolume,
  type ConstitutionalVolumeLifecycle,
} from "../constitution";

function parseArguments(arguments_: string[]): {
  volume: number;
  target: ConstitutionalVolumeLifecycle;
} {
  const volumeArgument = arguments_[0];
  const targetIndex = arguments_.indexOf("--target");
  const targetArgument =
    targetIndex >= 0 ? arguments_[targetIndex + 1] : undefined;
  if (
    !volumeArgument ||
    !/^\d+$/.test(volumeArgument) ||
    !targetArgument ||
    !constitutionalVolumeLifecycles.includes(
      targetArgument as ConstitutionalVolumeLifecycle
    )
  ) {
    throw new Error(
      "Usage: npm run pbos:promote-volume -- <volume-number> --target <lifecycle>"
    );
  }
  return {
    volume: Number.parseInt(volumeArgument, 10),
    target: targetArgument as ConstitutionalVolumeLifecycle,
  };
}

export function runPromoteVolume(
  arguments_: string[],
  rootDir = process.cwd()
): boolean {
  const { volume, target } = parseArguments(arguments_);
  const result = promoteConstitutionalVolume(
    volume,
    target,
    rootDir
  );
  console.log("");
  console.log("PBOS CONSTITUTIONAL VOLUME PROMOTION");
  console.log("");
  console.log(`Volume: ${result.volumeId}`);
  console.log(`Transition: ${result.from} -> ${result.to}`);
  console.log(`Approved: ${result.approved ? "YES" : "NO"}`);
  console.log(`Reason: ${result.reason}`);
  console.log("Evidence:");
  for (const evidence of result.evidence) {
    console.log(`- ${evidence}`);
  }
  console.log("Blocking Conditions:");
  for (const blocker of result.blockingConditions) {
    console.log(`- ${blocker}`);
  }
  if (result.blockingConditions.length === 0) {
    console.log("- None");
  }
  return result.approved;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const approved = runPromoteVolume(process.argv.slice(2));
    if (!approved) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

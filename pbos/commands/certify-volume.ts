#!/usr/bin/env tsx

import { certifyConstitutionalVolume } from "../constitution";

export function runCertifyVolume(
  argument: string | undefined,
  rootDir = process.cwd()
): void {
  if (!argument || !/^\d+$/.test(argument)) {
    throw new Error(
      "Usage: npm run pbos:certify-volume -- <volume-number>"
    );
  }

  const report = certifyConstitutionalVolume(
    Number.parseInt(argument, 10),
    rootDir
  );
  console.log("");
  console.log("PBOS CONSTITUTIONAL CERTIFICATION REPORT");
  console.log("");
  console.log(`Volume: ${report.volumeId}`);
  console.log(`Status: ${report.status} (${report.lifecycle})`);
  console.log(
    `Certification Score: ${report.certificationScore}/100`
  );
  console.log(
    `Passed Rules: ${report.passedRules.join(", ") || "None"}`
  );
  console.log(
    `Failed Rules: ${report.failedRules.join(", ") || "None"}`
  );
  console.log("Blocking Conditions:");
  for (const condition of report.blockingConditions) {
    console.log(`- ${condition}`);
  }
  if (report.blockingConditions.length === 0) {
    console.log("- None");
  }
  console.log(
    `Promotion Recommendation: ${report.promotionRecommendation.reason}`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    runCertifyVolume(process.argv[2]);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

import { verifyRepository } from "../core/VerificationEngine.mjs";
import { saveBaseline } from "../core/BaselineEngine.mjs";

export async function baseline() {
  console.log("");
  console.log("==================================");
  console.log("REPOSITORY BASELINE");
  console.log("==================================");
  console.log("");

  console.log("Capturing current repository state...");
  console.log("");

  const report = await verifyRepository();

  await saveBaseline(report);

  console.log(`TypeScript : ${report.typescript.passed ? "PASS" : "FAIL"}`);
  console.log(`Build      : ${report.build.passed ? "PASS" : "FAIL"}`);
  console.log(`Lint       : ${report.lint.passed ? "PASS" : "FAIL"}`);

  console.log("");
  console.log("Baseline saved.");
  console.log("Future missions may not reduce repository health.");
}
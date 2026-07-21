import { loadMission } from "../core/StateEngine.mjs";
import { verifyRepository } from "../core/VerificationEngine.mjs";

function icon(pass) {
  return pass ? "✅" : "❌";
}

export async function verify() {

  const mission = await loadMission();

  if (!mission.id) {
    console.log("No active mission.");
    return;
  }

  console.log("");
  console.log("==================================");
  console.log("MISSION VERIFICATION");
  console.log("==================================");
  console.log("");

  console.log(`Mission : ${mission.title}`);
  console.log("");

  console.log("Running repository verification...");
  console.log("");

  const report = await verifyRepository();

  console.log(`${icon(report.lint.passed)} Lint`);
  console.log(`${icon(report.typescript.passed)} TypeScript`);
  console.log(`${icon(report.build.passed)} Build`);

  console.log("");

  if (report.overall) {

    console.log("==================================");
    console.log("STATUS: READY FOR COMPLETION");
    console.log("==================================");

  } else {

    console.log("==================================");
    console.log("STATUS: NOT READY");
    console.log("==================================");

  }

}

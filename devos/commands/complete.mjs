import { loadMission, clearMission } from "../core/StateEngine.mjs";
import { loadVerification } from "../core/VerificationState.mjs";
import { evaluateRepository } from "../core/RepositoryGovernor.mjs";

export async function complete() {
  const mission = await loadMission();

  if (!mission.id) {
    console.log("No active mission.");
    return;
  }

  console.log("complete() started");

  const report = await loadVerification();

  if (!report) {
    console.log("");
    console.log("==================================");
    console.log("NO VERIFICATION FOUND");
    console.log("==================================");
    console.log("");
    console.log("Run:");
    console.log("node devos/playbook.mjs verify");
    console.log("");
    return;
  }

  const result = await evaluateRepository(report);

  if (!result.passed) {
    console.log("");
    console.log("==================================");
    console.log("MISSION BLOCKED");
    console.log("==================================");
    console.log("");
    console.log("Repository health has regressed.");
    console.log("");
    return;
  }

  mission.completedAt = new Date().toISOString();

  console.log("");
  console.log("==================================");
  console.log("MISSION COMPLETE");
  console.log("==================================");
  console.log(`Mission : ${mission.title}`);
  console.log(`Completed : ${mission.completedAt}`);

  await clearMission();

  console.log("");
  console.log("Mission state cleared.");
  console.log("");
  console.log("Next command:");
  console.log("node devos/playbook.mjs next");
}
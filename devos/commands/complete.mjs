import readline from "readline";
import { loadMission, clearMission } from "../core/StateEngine.mjs";

export async function complete() {

  const mission = await loadMission();

  if (!mission.id) {
    console.log("No active mission.");
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve =>
    rl.question(
      "Did you verify Architecture, Sprint and Master Checklist? (y/n): ",
      resolve
    )
  );

  rl.close();

  if (answer.toLowerCase() !== "y") {
    console.log("Mission not completed.");
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

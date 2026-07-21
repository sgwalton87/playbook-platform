import { hasMission, loadMission } from "../core/StateEngine.mjs";

export async function resume() {

  if (!(await hasMission())) {
    console.log("");
    console.log("No active mission.");
    return;
  }

  const mission = await loadMission();

  console.log("");
  console.log("==================================");
  console.log("CURRENT MISSION");
  console.log("==================================");
  console.log(`Mission : ${mission.title}`);
  console.log(`Phase   : ${mission.phase}`);
  console.log(`Status  : ${mission.status}`);

  if (mission.startedAt) {
    console.log(`Started : ${mission.startedAt}`);
  }

  if (mission.completedAt) {
    console.log(`Completed : ${mission.completedAt}`);
  }
}

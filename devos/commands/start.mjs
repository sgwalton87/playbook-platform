import { hasMission, loadMission, saveMission } from "../core/StateEngine.mjs";

export async function start() {

  if (!(await hasMission())) {
    console.log("");
    console.log("No active mission.");
    console.log("Run: node devos/playbook.mjs next");
    return;
  }

  const mission = await loadMission();

  if (!mission.startedAt) {
    mission.startedAt = new Date().toISOString();
  }

  mission.status = "IMPLEMENTING";

  await saveMission(mission);

  console.log("");
  console.log("==================================");
  console.log("MISSION STARTED");
  console.log("==================================");
  console.log(`Mission : ${mission.title}`);
  console.log(`Phase   : ${mission.phase}`);
  console.log(`Status  : ${mission.status}`);
  console.log(`Started : ${mission.startedAt}`);
  console.log("");
  console.log("Begin implementation.");
}

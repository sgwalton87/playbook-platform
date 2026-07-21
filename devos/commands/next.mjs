import { getNextMission } from "../core/MissionEngine.mjs";
import { saveMission } from "../core/StateEngine.mjs";

export async function next() {

  const mission = await getNextMission();

  if (!mission) {
    console.log("No remaining missions.");
    return;
  }

  await saveMission(mission);

  console.log("");
  console.log("==================================");
  console.log("NEXT MISSION");
  console.log("==================================");

  console.log(`Phase  : ${mission.phase}`);
  console.log(`Mission: ${mission.title}`);

  console.log("");
  console.log("Mission saved.");
}

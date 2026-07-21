import { loadMission } from "../core/StateEngine.mjs";
import { markAccepted } from "../core/ChecklistEngine.mjs";

export async function accept() {

  const mission = await loadMission();

  if (!mission.id) {
    console.log("No active mission.");
    return;
  }

  console.log("");
  console.log("Definition of Done");
  console.log("");
  console.log("Verify manually:");
  console.log("✓ Interface");
  console.log("✓ Persistence");
  console.log("✓ Permissions");
  console.log("✓ Integrations");
  console.log("✓ Tests");
  console.log("✓ Build");
  console.log("✓ End-to-End");
  console.log("");
  console.log("If all items are satisfied, accept this mission.");
  console.log("");

  await markAccepted(mission.title);

  console.log("MISSION ACCEPTED");
}
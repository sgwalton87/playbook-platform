import fs from "node:fs";
import path from "node:path";
import { getManualQaPathway } from "../../lib/connected-journey/connectedJourneyQa";

const root = process.cwd();

function routeToFile(route: string) {
  if (route === "/") return "app/page.tsx";
  if (route === "/u/demo") return "app/u/[username]/page.tsx";

  return `app${route}/page.tsx`;
}

const routes = getManualQaPathway();

const missing = routes
  .map((route) => ({ route, file: routeToFile(route) }))
  .filter((item) => !fs.existsSync(path.join(root, item.file)));

const requiredFiles = [
  "app/api/parse-transcript/route.ts",
  "components/ag/AGTracker.tsx",
  "app/api/social/comments/route.ts",
  "app/api/social/reactions/route.ts",
  "app/api/albums/route.ts",
  "app/api/mentor-directory/route.ts",
  "app/api/community-events/route.ts",
  "app/api/community-events/rsvp/route.ts",
  "app/api/trust/report/route.ts",
  "app/api/trust/block/route.ts",
  "app/api/admin/moderation/route.ts",
];

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

console.log("\nCONNECTED JOURNEY QA");
console.log("====================");

if (missing.length) {
  console.log("\nMissing route pages:");
  missing.forEach((item) => console.log(`- ${item.route} => ${item.file}`));
} else {
  console.log("✓ All manual QA route pages exist.");
}

if (missingFiles.length) {
  console.log("\nMissing connected system files:");
  missingFiles.forEach((file) => console.log(`- ${file}`));
} else {
  console.log("✓ All connected system files exist.");
}

console.log("\nManual QA click order:");
routes.forEach((route, index) => console.log(`${index + 1}. ${route}`));

if (missing.length || missingFiles.length) {
  process.exitCode = 1;
}

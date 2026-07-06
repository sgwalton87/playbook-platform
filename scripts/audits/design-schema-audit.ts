import fs from "node:fs";
import path from "node:path";
import { getDesignSchemaRoutes, getLegacyDesignRoutes, summarizeDesignSchema } from "../../lib/design-schema/designSchemaAudit";

const root = process.cwd();

function routeToFile(route: string) {
  if (route.includes("[slug]")) return "app/courses/[slug]/page.tsx";
  if (route.includes("[username]")) return "app/u/[username]/page.tsx";
  return `app${route}/page.tsx`;
}

console.log("\nDESIGN SCHEMA AUDIT");
console.log("===================");

const summary = summarizeDesignSchema();
console.log(`Current Schema: ${summary["Current Schema"]}`);
console.log(`Legacy Schema: ${summary["Legacy Schema"]}`);
console.log(`Special Experience: ${summary["Special Experience"]}`);

console.log("\nMissing files:");
let missing = 0;

for (const route of getDesignSchemaRoutes()) {
  const file = routeToFile(route.route);
  if (!fs.existsSync(path.join(root, file))) {
    missing++;
    console.log(`- ${route.route} => ${file}`);
  }
}

if (!missing) console.log("✓ none");

console.log("\nLegacy routes to update:");
const legacy = getLegacyDesignRoutes();
legacy.forEach((route, index) => {
  console.log(`${index + 1}. ${route.route} — ${route.label}`);
});

if (!legacy.length) console.log("✓ none");

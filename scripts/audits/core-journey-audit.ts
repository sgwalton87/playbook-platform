import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(full);

    return [full];
  });
}

const appFiles = walk(path.join(ROOT, "app"));
const componentFiles = walk(path.join(ROOT, "components"));

const pages = appFiles.filter((file) => file.endsWith("page.tsx"));
const apiRoutes = appFiles.filter((file) => file.endsWith("route.ts"));

const shellReferences = [...pages, ...componentFiles]
  .filter((file) => /\.(tsx|ts)$/.test(file))
  .map((file) => ({
    file,
    text: fs.readFileSync(file, "utf8"),
  }))
  .filter(
    ({ text }) =>
      text.includes("<AppShell") ||
      text.includes("<UnifiedAppShell") ||
      text.includes("import AppShell") ||
      text.includes("import UnifiedAppShell")
  );

const requiredRoutes = [
  "app/start/page.tsx",
  "app/transcript/page.tsx",
  "app/academic-readiness/page.tsx",
  "app/scholar-athlete-os/page.tsx",
  "app/opportunities/page.tsx",
  "app/opportunity-toolkit/page.tsx",
  "app/support-network/page.tsx",
  "app/messages/page.tsx",
  "app/courses/page.tsx",
  "app/reward-economy/page.tsx",
  "app/demo/page.tsx",
  "app/demo/founder-case-study/page.tsx",
];

const missing = requiredRoutes.filter(
  (route) => !fs.existsSync(path.join(ROOT, route))
);

console.log("\nPLAYBOOK CORE JOURNEY AUDIT");
console.log("===========================");
console.log(`Pages discovered: ${pages.length}`);
console.log(`API routes discovered: ${apiRoutes.length}`);
console.log(`Potential shell references: ${shellReferences.length}`);

if (shellReferences.length) {
  console.log("\nPotential duplicate-shell files:");
  shellReferences.forEach(({ file }) => {
    console.log(`- ${path.relative(ROOT, file)}`);
  });
}

if (missing.length) {
  console.log("\nMissing required journey routes:");
  missing.forEach((route) => console.log(`- ${route}`));
  process.exitCode = 1;
} else {
  console.log("\n✓ All required core journey routes exist.");
}

console.log("\nCore academic infrastructure:");
[
  "app/transcript/page.tsx",
  "app/api/parse-transcript/route.ts",
  "components/ag/AGTracker.tsx",
  "lib/academic-intelligence/academicIntelligenceEngine.ts",
  "lib/academic-intelligence/transcript/transcriptIntelligence.ts",
  "lib/academic-intelligence/ag/agIntelligence.ts",
].forEach((file) => {
  console.log(`${fs.existsSync(path.join(ROOT, file)) ? "✓" : "✗"} ${file}`);
});

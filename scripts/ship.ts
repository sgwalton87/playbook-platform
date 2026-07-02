import { execSync } from "child_process";
import { runArchivist } from "../lib/archivist/ArchivistEngine";

function run(cmd: string) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: { ...process.env, PLAYBOOK_ARCHIVIST_RUNNING: "1" } });
}

console.log("=====================================");
console.log("🚀 PLAYBOOK ARCHIVIST v2 SHIP");
console.log("=====================================");

run("npm test");
run("bash scripts/build.sh");

runArchivist();
run("npm run cartographer");
run("npm run sentinel");
run("npm run docs:governor");

run("git add .");

try {
  execSync("git diff --cached --quiet", { stdio: "ignore" });
  console.log("No changes to commit. Ship checks passed.");
} catch {
  run('git commit -m "Archivist v2 ship update"');
}

run("git status");

console.log("=====================================");
console.log("✅ ARCHIVIST v2 SHIP COMPLETE");
console.log("=====================================");

import fs from "node:fs";

const project = JSON.parse(
  fs.readFileSync("founder/project.json", "utf8")
);

for (const phase of project.phases) {
  console.log(`\nPHASE ${phase.number}: ${phase.title}`);

  for (const task of project.tasks.filter((item) => item.phaseId === phase.id)) {
    console.log(`  ${task.status.padEnd(12)} ${task.id}`);
  }
}

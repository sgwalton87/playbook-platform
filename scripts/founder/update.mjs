import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const registryPath = path.join(root, "founder", "project.json");

if (!fs.existsSync(registryPath)) {
  throw new Error("Founder registry missing. Run npm run founder:bootstrap first.");
}

const [command, id, ...remaining] = process.argv.slice(2);
const project = JSON.parse(fs.readFileSync(registryPath, "utf8"));

function flag(name, fallback = "") {
  const prefix = `--${name}=`;
  const value = remaining.find((item) => item.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function save() {
  project.updatedAt = new Date().toISOString();
  fs.writeFileSync(registryPath, JSON.stringify(project, null, 2) + "\n");

  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts", "founder", "generate-docs.mjs")],
    { stdio: "inherit" }
  );

  if (result.status !== 0) process.exit(result.status || 1);
}

function addEvent(event) {
  project.events.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actor: flag("actor", "Stephisha Walton"),
    createdAt: new Date().toISOString(),
    filesTouched: flag("files")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    ...event,
  });
}

if (command === "complete-task") {
  const task = project.tasks.find((item) => item.id === id);

  if (!task) {
    console.error(`❌ Task not found: ${id}`);
    console.error("Run: npm run founder:list");
    process.exit(1);
  }

  task.status = "complete";
  task.completedAt = new Date().toISOString();
  task.owner = flag("actor", task.owner || "Stephisha Walton");
  task.notes = flag("notes", task.notes || "");
  task.filesTouched = flag("files")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  addEvent({
    type: "task_completed",
    taskId: task.id,
    phaseId: task.phaseId,
    title: `Completed: ${task.title}`,
    description:
      flag("notes") ||
      `${task.title} passed its required completion and validation workflow.`,
  });

  save();
  console.log(`✅ Completed task: ${task.title}`);
} else if (command === "set-status") {
  const task = project.tasks.find((item) => item.id === id);
  const status = flag("status");

  if (!task) throw new Error(`Task not found: ${id}`);

  const allowed = [
    "not_started",
    "in_progress",
    "testing",
    "complete",
    "needs_fix",
  ];

  if (!allowed.includes(status)) {
    throw new Error(`Invalid status. Use: ${allowed.join(", ")}`);
  }

  task.status = status;
  task.notes = flag("notes", task.notes || "");

  addEvent({
    type: status === "complete" ? "task_completed" : "task_updated",
    taskId: task.id,
    phaseId: task.phaseId,
    title: `${task.title}: ${status.replaceAll("_", " ")}`,
    description: flag("notes") || `Task status changed to ${status}.`,
  });

  save();
} else if (command === "add-bug") {
  const title = [id, ...remaining.filter((item) => !item.startsWith("--"))]
    .filter(Boolean)
    .join(" ");

  if (!title) throw new Error("Provide a bug title.");

  project.bugs.push({
    id: `bug-${Date.now()}`,
    title,
    status: "open",
    severity: flag("severity", "medium"),
    relatedTaskId: flag("task") || undefined,
    notes: flag("notes"),
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  });

  addEvent({
    type: "bug_added",
    title: `Bug added: ${title}`,
    description: flag("notes") || title,
  });

  save();
} else if (command === "resolve-bug") {
  const bug = project.bugs.find((item) => item.id === id);

  if (!bug) throw new Error(`Bug not found: ${id}`);

  bug.status = "resolved";
  bug.resolvedAt = new Date().toISOString();

  addEvent({
    type: "bug_resolved",
    title: `Bug resolved: ${bug.title}`,
    description: flag("notes") || bug.notes || bug.title,
  });

  save();
} else {
  console.log(`
Founder Project Intelligence commands:

node scripts/founder/update.mjs complete-task <task-id> --notes="..." --files="file1,file2"
node scripts/founder/update.mjs set-status <task-id> --status=testing
node scripts/founder/update.mjs add-bug "Bug title" --severity=high --notes="..."
node scripts/founder/update.mjs resolve-bug <bug-id> --notes="..."
`);
}

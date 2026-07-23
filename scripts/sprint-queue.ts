import queue from "../docs/sprints/AUTO_BUILD_QUEUE.json";

const validStatuses = new Set([
  "queued",
  "in-progress",
  "local-complete",
  "in-review",
  "merged",
  "blocked",
]);

const errors: string[] = [];
const ids = new Set<string>();

for (const sprint of queue.sprints) {
  if (ids.has(sprint.id)) errors.push(`Duplicate sprint id: ${sprint.id}`);
  ids.add(sprint.id);

  if (!validStatuses.has(sprint.status)) {
    errors.push(`${sprint.id} has invalid status: ${sprint.status}`);
  }

  if (!sprint.branch.startsWith("agent/")) {
    errors.push(`${sprint.id} branch must start with agent/`);
  }

  if (sprint.status === "merged" && !sprint.mergeEvidence) {
    errors.push(`${sprint.id} is merged without merge evidence`);
  }
}

for (const sprint of queue.sprints) {
  for (const dependency of sprint.dependsOn) {
    if (!ids.has(dependency)) {
      errors.push(`${sprint.id} has unknown dependency: ${dependency}`);
    }
  }
}

if (errors.length) {
  console.error("Sprint queue is invalid:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const next = queue.sprints.find((sprint) => {
  if (sprint.status !== "queued" && sprint.status !== "local-complete") return false;
  return sprint.dependsOn.every((dependency) =>
    queue.sprints.some((candidate) => candidate.id === dependency && candidate.status === "merged")
  );
});

console.log(`Sprint queue valid: ${queue.sprints.length} sprints`);
console.log(next ? `Next actionable sprint: ${next.id} — ${next.title} (${next.status})` : "No sprint is currently actionable.");

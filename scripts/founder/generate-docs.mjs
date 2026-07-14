import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "founder", "project.json");
const docsRoot = path.join(root, "docs");

if (!fs.existsSync(registryPath)) {
  throw new Error("founder/project.json is missing. Run npm run founder:bootstrap.");
}

const project = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const statusIcon = {
  not_started: "⬜",
  in_progress: "🟨",
  testing: "🟦",
  complete: "🟩",
  needs_fix: "🟥",
};

function write(name, content) {
  const destination = path.join(docsRoot, name);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content.trim() + "\n");
  console.log(`✅ Updated ${destination}`);
}

function tasksForPhase(phaseId) {
  return project.tasks.filter((task) => task.phaseId === phaseId);
}

function calculate() {
  for (const phase of project.phases) {
    const tasks = tasksForPhase(phase.id);
    const completed = tasks.filter((task) => task.status === "complete").length;
    phase.completionPercent = tasks.length
      ? Math.round((completed / tasks.length) * 100)
      : 0;

    if (phase.completionPercent === 100) phase.status = "complete";
    else if (tasks.some((task) => task.status === "needs_fix")) phase.status = "needs_fix";
    else if (tasks.some((task) => task.status === "testing")) phase.status = "testing";
    else if (tasks.some((task) => task.status === "in_progress" || task.status === "complete")) {
      phase.status = "in_progress";
    } else phase.status = "not_started";
  }

  const completed = project.tasks.filter((task) => task.status === "complete").length;
  project.overallCompletionPercent = project.tasks.length
    ? Math.round((completed / project.tasks.length) * 100)
    : 0;

  project.updatedAt = new Date().toISOString();
  fs.writeFileSync(registryPath, JSON.stringify(project, null, 2) + "\n");
}

calculate();

const checklist = [
  "# PLAYBOOK OS — MASTER BUILD CHECKLIST",
  "",
  `**Overall completion:** ${project.overallCompletionPercent}%`,
  `**Last updated:** ${project.updatedAt}`,
  "",
  "## Status legend",
  "",
  "- ⬜ Not Started",
  "- 🟨 In Progress",
  "- 🟦 Testing",
  "- 🟩 Complete",
  "- 🟥 Needs Fix",
  "",
  "## Definition of Done",
  "",
  "A task may be marked complete only after its interface, persistence, permissions, integrations, tests, build, and end-to-end workflow have been validated.",
  "",
];

for (const phase of project.phases) {
  checklist.push(
    `# Phase ${phase.number} — ${phase.title}`,
    "",
    `**Status:** ${statusIcon[phase.status]} ${phase.status.replaceAll("_", " ")}`,
    `**Completion:** ${phase.completionPercent}%`,
    ""
  );

  for (const task of tasksForPhase(phase.id)) {
    checklist.push(`- ${statusIcon[task.status]} ${task.title}`);
  }

  checklist.push("");
}

checklist.push(
  "# Final Release Checklist",
  "",
  "- ⬜ Desktop validation",
  "- ⬜ Tablet validation",
  "- ⬜ Mobile validation",
  "- ⬜ Accessibility validation",
  "- ⬜ Performance validation",
  "- ⬜ Security and RLS validation",
  "- ⬜ Production database validation",
  "- ⬜ Storage and backup validation",
  "- ⬜ Email and notification validation",
  "- ⬜ Monitoring and error logging",
  "- ⬜ Soft launch",
  "- ⬜ Beta feedback resolved",
  "- ⬜ Final production build",
  "- ⬜ Public launch 🚀"
);

write("PLAYBOOK_MASTER_CHECKLIST.md", checklist.join("\n"));

const releases = [
  "# PLAYBOOK OS — RELEASE LOG",
  "",
  `Last generated: ${project.updatedAt}`,
  "",
];

const completionEvents = [...project.events]
  .filter((event) => event.type === "task_completed" || event.type === "phase_completed")
  .reverse();

if (!completionEvents.length) {
  releases.push("No completion events have been recorded yet.");
} else {
  for (const event of completionEvents) {
    releases.push(
      `## ${event.title}`,
      "",
      `- **Date:** ${event.createdAt}`,
      `- **Completed by:** ${event.actor}`,
      `- **Description:** ${event.description}`,
      `- **Files:** ${event.filesTouched?.length ? event.filesTouched.join(", ") : "Not recorded"}`,
      ""
    );
  }
}

write("PLAYBOOK_RELEASE_LOG.md", releases.join("\n"));

const journal = [
  "# PLAYBOOK OS — FOUNDER JOURNAL",
  "",
  "This journal records the product decisions, milestones, and reasons behind the development of Playbook OS.",
  "",
];

const journalEvents = [...project.events].reverse();

if (!journalEvents.length) {
  journal.push("No Founder Knowledge Base events have been recorded yet.");
} else {
  for (const event of journalEvents) {
    journal.push(
      `## ${event.createdAt.slice(0, 10)} — ${event.title}`,
      "",
      event.description,
      "",
      `**Recorded by:** ${event.actor}`,
      ""
    );
  }
}

write("PLAYBOOK_FOUNDER_JOURNAL.md", journal.join("\n"));

const architecture = [
  "# PLAYBOOK OS — ARCHITECTURE STATUS",
  "",
  `**Overall completion:** ${project.overallCompletionPercent}%`,
  "",
  "```text",
  "Authentication",
  "    ↓",
  "Role Selection",
  "    ↓",
  "Role-Specific Onboarding",
  "    ↓",
  "Profile + Public Identity",
  "    ↓",
  "Role-Specific Operating System",
  "    ↓",
  "Network → Feed → Messaging → Opportunities → Courses",
  "    ↓",
  "Founder Project Intelligence",
  "```",
  "",
  "## System status",
  "",
];

for (const phase of project.phases) {
  architecture.push(
    `- ${statusIcon[phase.status]} **Phase ${phase.number}: ${phase.title}** — ${phase.completionPercent}%`
  );
}

write("PLAYBOOK_ARCHITECTURE.md", architecture.join("\n"));

const bugs = [
  "# PLAYBOOK OS — BUG TRACKER",
  "",
  "## Open bugs",
  "",
];

const openBugs = project.bugs.filter((bug) => bug.status === "open");
const resolvedBugs = project.bugs.filter((bug) => bug.status === "resolved");

if (!openBugs.length) bugs.push("No open bugs recorded.");
else {
  for (const bug of openBugs) {
    bugs.push(`- 🟥 **${bug.title}** — ${bug.severity}: ${bug.notes || ""}`);
  }
}

bugs.push("", "## Resolved bugs", "");

if (!resolvedBugs.length) bugs.push("No resolved bugs recorded.");
else {
  for (const bug of resolvedBugs) {
    bugs.push(`- 🟩 **${bug.title}** — resolved ${bug.resolvedAt || ""}`);
  }
}

write("PLAYBOOK_BUG_TRACKER.md", bugs.join("\n"));

console.log(`\n🎯 Playbook readiness: ${project.overallCompletionPercent}%`);

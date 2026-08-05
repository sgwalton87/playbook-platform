import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const config = JSON.parse(readFileSync(resolve(root, ".pbos/archivist.json"), "utf8"));
const message = process.argv.slice(2).join(" ").trim() || execFileSync("git", ["log", "-1", "--pretty=%B"], { cwd: root, encoding: "utf8" }).trim();
if (!/^milestone(?:\([^)]*\))?:\s+.+/i.test(message)) process.exit(0);
const revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const remote = execFileSync("git", ["remote", "get-url", "origin"], { cwd: root, encoding: "utf8" }).trim();
const discoveredRepository = remote.replace(/^https:\/\/github\.com\//, "").replace(/^git@github\.com:/, "").replace(/\.git$/, "");
const repository = config.repository === "ASSIGNED_AT_CREATION" ? discoveredRepository : config.repository;
const recordedAt = new Date();
const validation = config.validationCommands.map(command => {
  const result = spawnSync(command[0], command.slice(1), { cwd: root, encoding: "utf8", stdio: "inherit" });
  return { command: command.join(" "), state: result.status === 0 ? "PASSED" : "FAILED", reference: "local-command:" + command.join(" ") };
});
let progress = {};
if (config.progressFile && existsSync(resolve(root, config.progressFile))) progress = JSON.parse(readFileSync(resolve(root, config.progressFile), "utf8"));
const state = validation.every(item => item.state === "PASSED") ? "VERIFIED" : "VALIDATION_FAILED";
const timestamp = recordedAt.toISOString();
const stamp = timestamp.replaceAll(":", "-").replace("T", "_").replace(/\.\d{3}Z$/, "Z");
const slug = message.replace(/^milestone(?:\([^)]*\))?:\s*/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "milestone";
const canonical = JSON.stringify({ systemId: config.systemId, repository, revision, message, progress, validation, timestamp, state });
const digest = createHash("sha256").update(canonical).digest("hex");
const archiveId = "PBOS-ARCHIVE-" + digest.slice(0, 16).toUpperCase();
const evidence = validation.map(item => "- " + (item.state === "PASSED" ? "PASS" : "FAIL") + ": " + item.command + " — " + item.reference).join("\n");
const progressText = JSON.stringify(progress, null, 2).split("\n").map(line => "    " + line).join("\n");
const content = "# " + config.systemName + " Milestone\n\n- Archive: " + archiveId + "\n- System: " + config.systemId + "\n- Repository: " + repository + "\n- Revision: " + revision + "\n- Recorded: " + timestamp + "\n- State: " + state + "\n- Digest: sha256:" + digest + "\n\n## Milestone\n\n" + message + "\n\n## Validation Evidence\n\n" + evidence + "\n\n## Progress\n\n" + progressText + "\n";
const milestone = "docs/project-management/milestones/" + stamp + "-" + slug + ".md";
const snapshot = "docs/project-management/snapshots/" + stamp + "-" + slug + ".md";
for (const [path, value] of [[milestone, content], [snapshot, content], ["docs/project-management/snapshots/latest.md", content]]) {
  const target = resolve(root, path); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, value);
}
const index = resolve(root, "docs/project-management/milestones/index.md");
mkdirSync(dirname(index), { recursive: true });
if (!existsSync(index)) writeFileSync(index, "# PBOS Milestone Index\n");
appendFileSync(index, "\n- [" + timestamp + " — " + message + "](" + milestone.split("/").at(-1) + ") — " + state + " — " + revision + "\n");
const journal = resolve(root, "founders-journal/daily/" + timestamp.slice(0, 10) + ".md");
mkdirSync(dirname(journal), { recursive: true });
appendFileSync(journal, "\n## " + timestamp + " — " + message + "\n\n- System: " + config.systemName + " (" + config.systemId + ")\n- Revision: " + revision + "\n- Evidence state: " + state + "\n- Archive: " + archiveId + "\n");
console.log("PBOS Archivist: " + state + " — " + milestone);
if (state !== "VERIFIED") process.exitCode = 1;

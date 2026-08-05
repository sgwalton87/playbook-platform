import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve, sep } from "node:path";
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
let hooksPath = ".githooks";
try { hooksPath = execFileSync("git", ["config", "--get", "core.hooksPath"], { cwd: root, encoding: "utf8" }).trim() || hooksPath; }
catch { execFileSync("git", ["config", "core.hooksPath", hooksPath], { cwd: root }); }
const dispatcher = resolve(root, hooksPath, "post-commit");
if (!dispatcher.startsWith(resolve(root) + sep)) throw new Error("Refusing to install a Git hook outside the repository.");
const marker = "# PBOS_ENGINEERING_MEMORY";
const invocation = "\n" + marker + "\nrepo_root=\"$(git rev-parse --show-toplevel)\"\n\"$repo_root/.githooks/pbos-archivist-post-commit\"\n";
mkdirSync(dirname(dispatcher), { recursive: true });
if (!existsSync(dispatcher)) writeFileSync(dispatcher, "#!/bin/sh\nset -eu\n");
if (!readFileSync(dispatcher, "utf8").includes(marker)) appendFileSync(dispatcher, invocation);
chmodSync(dispatcher, 0o755);
chmodSync(root + "/.githooks/pbos-archivist-post-commit", 0o755);
console.log("PBOS Archivist local hook installed for this clone.");

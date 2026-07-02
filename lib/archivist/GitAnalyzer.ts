import { execSync } from "child_process";

function run(cmd: string) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

export function analyzeGitChanges() {
  const changedFiles = run("git diff --name-only").split("\n").filter(Boolean);
  const stagedFiles = run("git diff --cached --name-only").split("\n").filter(Boolean);
  const allFiles = Array.from(new Set([...changedFiles, ...stagedFiles]));

  return {
    changedFiles: allFiles,
    engines: allFiles.filter(f => f.includes("lib/engines/")),
    repositories: allFiles.filter(f => f.includes("lib/repositories/")),
    events: allFiles.filter(f => f.includes("lib/events/")),
    migrations: allFiles.filter(f => f.includes("supabase/migrations/")),
    tests: allFiles.filter(f => f.includes("tests/")),
    docs: allFiles.filter(f => f.includes("docs/")),
    components: allFiles.filter(f => f.includes("components/")),
    appRoutes: allFiles.filter(f => f.includes("app/")),
    lastCommit: run("git log -1 --pretty=%B") || "No commits yet",
  };
}

import { execFileSync } from "node:child_process";
import { BranchInfo, RepositoryModel } from "./types";

function git(rootDir: string, args: readonly string[]): string {
  return execFileSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function analyzeRepository(rootDir = process.cwd()): RepositoryModel {
  const repositoryRoot = git(rootDir, ["rev-parse", "--show-toplevel"]);
  const currentBranch = git(repositoryRoot, ["branch", "--show-current"]);

  const branches = git(repositoryRoot, [
    "for-each-ref",
    "--format=%(refname:short)",
    "refs/heads",
  ])
    .split("\n")
    .filter(Boolean);

  const data: BranchInfo[] = branches.map((name) => {

    // git rev-list --left-right --count main...branch returns:
    // <commits only in main> <commits only in branch>
    const [commitsOnlyInMain, commitsOnlyInBranch] = git(repositoryRoot, [
      "rev-list",
      "--left-right",
      "--count",
      `main...${name}`,
    ])
      .split(/\s+/)
      .map(Number);

    const behind = commitsOnlyInMain;
    const ahead = commitsOnlyInBranch;

    const latestCommitSha = git(repositoryRoot, ["rev-parse", name]);

    const latestCommit = git(repositoryRoot, ["log", "-1", "--pretty=%s", name]);

    const changedFiles = git(repositoryRoot, ["diff", "--name-only", `main..${name}`])
      .split("\n")
      .filter(Boolean);

    return {
      name,
      current: name === currentBranch,
      ahead,
      behind,
      latestCommit,
      latestCommitSha,
      changedFiles,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    productionBranch: "main",
    currentBranch,
    branches: data,
  };
}

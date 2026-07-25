import { execSync } from "node:child_process";
import { BranchInfo, RepositoryModel } from "./types";

function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

export function analyzeRepository(): RepositoryModel {
  const currentBranch = run("git branch --show-current");

  const branches = run("git for-each-ref --format='%(refname:short)' refs/heads")
    .split("\n")
    .filter(Boolean);

  const data: BranchInfo[] = branches.map((name) => {

    // git rev-list --left-right --count main...branch returns:
    // <commits only in main> <commits only in branch>
    const [commitsOnlyInMain, commitsOnlyInBranch] = run(
      `git rev-list --left-right --count main...${name}`
    )
      .split(/\s+/)
      .map(Number);

    const behind = commitsOnlyInMain;
    const ahead = commitsOnlyInBranch;

    const latestCommitSha = run(`git rev-parse ${name}`);

    const latestCommit = run(
      `git log -1 --pretty=%s ${name}`
    );

    const changedFiles = run(
      `git diff --name-only main..${name}`
    )
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
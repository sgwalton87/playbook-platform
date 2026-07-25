import { BranchInfo } from "./types";

export type BranchScore = {
  score: number;
  reasons: string[];
};

export function scoreBranch(branch: BranchInfo): BranchScore {
  let score = 0;
  const reasons: string[] = [];

  // Current branch
  if (branch.current) {
    score += 10;
    reasons.push("Current branch");
  }

  // Ahead / behind
  score += Math.min(branch.ahead, 25);
  if (branch.ahead > 0) {
    reasons.push(`Ahead of main by ${branch.ahead} commit(s)`);
  }

  score -= branch.behind * 2;
  if (branch.behind > 0) {
    reasons.push(`Behind main by ${branch.behind} commit(s)`);
  }

  // Branch naming heuristics
  const name = branch.name.toLowerCase();

  if (name.includes("integration")) {
    score += 25;
    reasons.push("Integration branch");
  }

  if (name.includes("recovery")) {
    score -= 100;
    reasons.push("Recovery branch");
  }

  if (name.includes("backup")) {
    score -= 75;
    reasons.push("Backup branch");
  }

  if (name.includes("archive")) {
    score -= 100;
    reasons.push("Archived branch");
  }

  return {
    score,
    reasons,
  };
}
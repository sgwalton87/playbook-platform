import { BranchInfo } from "./types";

export function compareBranch(branch: BranchInfo) {
  return {
    name: branch.name,
    ahead: branch.ahead,
    behind: branch.behind,
    changedFiles: branch.changedFiles.length,
  };
}

export interface BranchInfo {
  name: string;
  current: boolean;
  classification?: string;

  ahead: number;
  behind: number;

  latestCommit: string;
  latestCommitSha: string;

  changedFiles: string[];
}

export interface RepositoryModel {
  generatedAt: string;
  productionBranch: string;
  currentBranch: string;
  branches: BranchInfo[];
}

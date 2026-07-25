export interface RepositoryIssue {
  type: string;
  severity: "low" | "medium" | "high";
  file: string;
  message: string;
}

export interface RepositoryAnalysis {
  scannedAt: string;

  filesScanned: number;

  directoriesScanned: number;

  todos: RepositoryIssue[];

  fixmes: RepositoryIssue[];

  missingFiles: RepositoryIssue[];

  emptyDirectories: RepositoryIssue[];

  score: number;
}

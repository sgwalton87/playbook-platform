export interface DiscoverySummary {
  generatedAt: string;

  totalFiles: number;

  markdownFiles: number;

  typescriptFiles: number;

  reactFiles: number;

  routes: string[];

  engines: string[];

  apiRoutes: string[];

  sqlFiles: string[];

  runtimeArtifacts: string[];
}

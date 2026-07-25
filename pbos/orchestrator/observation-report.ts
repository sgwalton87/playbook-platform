import type { analyzeRepository } from "../repository/analyze";
import type { buildDependencyGraph } from "../graph/resolver";
import type { getEngineHealth } from "../health/engine-health";
import type { buildWorld } from "../world/builder";

export interface ObservationReport {
  startedAt: string;
  finishedAt: string;

  repository: ReturnType<typeof analyzeRepository>;

  discovery: {
    files: string[];
    totalFiles: number;
  };

  graph: ReturnType<typeof buildDependencyGraph>;

  health: Awaited<ReturnType<typeof getEngineHealth>>;

  world: ReturnType<typeof buildWorld>;

  warnings: string[];
  blockers: string[];
}

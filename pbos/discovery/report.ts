import { scanDirectory } from "./scanner";
import { discoverRoutes } from "./routes";
import { discoverEngines } from "./engines";

import { DiscoverySummary } from "./types";

export function buildDiscoveryReport(): DiscoverySummary {

  const files = scanDirectory(".");

  return {

    generatedAt:
      new Date().toISOString(),

    totalFiles:
      files.length,

    markdownFiles:
      files.filter(f => f.endsWith(".md")).length,

    typescriptFiles:
      files.filter(f =>
        f.endsWith(".ts")
      ).length,

    reactFiles:
      files.filter(f =>
        f.endsWith(".tsx")
      ).length,

    routes:
      discoverRoutes(files),

    engines:
      discoverEngines(files),

    apiRoutes:
      files.filter(f =>
        f.includes("/api/")
      ),

    sqlFiles:
      files.filter(f =>
        f.endsWith(".sql")
      ),

    runtimeArtifacts:
      files.filter(f =>
        f.includes("runtime/")
      ),

  };

}

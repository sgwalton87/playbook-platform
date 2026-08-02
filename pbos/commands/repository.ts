import path from "node:path";
import { analyzeRepository, recommend } from "../repository";
import {
  Artifacts,
  Logger,
  Results,
  Runtime,
} from "../kernel";

export function runRepositoryAnalysis(rootDir = process.cwd()) {
  const model = analyzeRepository(rootDir);

  Runtime.save(
    path.join(rootDir, Artifacts.repository),
    model,
    "repository-intelligence"
  );

  Logger.blank();
  Logger.section("PBOS Repository Intelligence");

  Logger.keyValue("Current Branch", model.currentBranch);
  Logger.keyValue("Production", model.productionBranch);
  Logger.keyValue("Branches Found", model.branches.length);

  const recommendation = recommend(model);

  if (recommendation) {
    Logger.keyValue("Recommended", recommendation.branch.name);
    Logger.keyValue("Score", recommendation.score);

    Logger.blank();
    Logger.info("Reasons:");

    for (const reason of recommendation.reasons) {
      Logger.info(`  • ${reason}`);
    }
  }

  Logger.blank();
  Logger.info("Repository model written to:");
  Logger.info(path.join(rootDir, Artifacts.repository));

  return Results.success(
    "repository",
    model,
    Artifacts.repository,
    "Repository analysis completed."
  );
}

import { analyzeRepository, recommend } from "../repository";
import {
  Artifacts,
  Logger,
  Results,
  Runtime,
} from "../kernel";

export function runRepositoryAnalysis() {
  const model = analyzeRepository();

  Runtime.save(Artifacts.repository, model);

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
  Logger.info(Artifacts.repository);

  return Results.success(
    "repository",
    model,
    Artifacts.repository,
    "Repository analysis completed."
  );
}

import { writeFileSync } from "node:fs";
import { analyzeRepository, recommend } from "../repository";

export function runRepositoryAnalysis() {
  const model = analyzeRepository();

  writeFileSync(
    "pbos/runtime/repository.json",
    JSON.stringify(model, null, 2)
  );

  console.log("");
  console.log("PBOS Repository Intelligence");
  console.log("----------------------------");
  console.log(`Current Branch : ${model.currentBranch}`);
  console.log(`Production     : ${model.productionBranch}`);
  console.log(`Branches Found : ${model.branches.length}`);

  const recommendation = recommend(model);

  if (recommendation) {
    console.log(`Recommended    : ${recommendation.branch.name}`);
    console.log(`Score          : ${recommendation.score}`);

    console.log("");
    console.log("Reasons:");

    for (const reason of recommendation.reasons) {
      console.log(`  • ${reason}`);
    }
  }

  console.log("");
  console.log("Repository model written to:");
  console.log("pbos/runtime/repository.json");
}
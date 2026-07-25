import { analyzeRepository } from "./analysis";
import { writeRepositoryAnalysis } from "./report";

export function runRepositoryInspector() {

  console.log("");

  console.log("PBOS Repository Inspector");
  console.log("-------------------------");

  const report =
    analyzeRepository(".");

  writeRepositoryAnalysis(report);

  console.log(
    `Files Scanned : ${report.filesScanned}`
  );

  console.log(
    `TODOs         : ${report.todos.length}`
  );

  console.log(
    `FIXMEs        : ${report.fixmes.length}`
  );

  console.log(
    `Score         : ${report.score}`
  );

  console.log("");

  console.log(
    "Repository analysis written:"
  );

  console.log(
    "pbos/runtime/repository-analysis.json"
  );

}

import fs from "fs";

import { RepositoryAnalysis } from "./types";

export function writeRepositoryAnalysis(
  report: RepositoryAnalysis
) {

  fs.mkdirSync("pbos/runtime",{
    recursive:true,
  });

  fs.writeFileSync(
    "pbos/runtime/repository-analysis.json",
    JSON.stringify(report,null,2)
  );

}

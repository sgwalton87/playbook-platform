import fs from "fs";

import { ExecutionHistory } from "./types";

export function writeExecutionHistory(
  report: ExecutionHistory
) {

  fs.mkdirSync("pbos/runtime", {
    recursive: true,
  });

  fs.writeFileSync(
    "pbos/runtime/execution-history.json",
    JSON.stringify(report, null, 2)
  );

}

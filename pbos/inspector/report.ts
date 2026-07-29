import { RepositoryAnalysis } from "./types";
import { Artifacts, Runtime } from "../kernel";

export function writeRepositoryAnalysis(
  report: RepositoryAnalysis
) {

  Runtime.save(
    Artifacts.repositoryAnalysis,
    report,
    "repository-inspector"
  );

}

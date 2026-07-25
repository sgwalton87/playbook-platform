import { RepositoryModel } from "./types";
import { scoreBranch } from "./score";

export function recommend(model: RepositoryModel) {
  return model.branches
    .filter((b) => b.name !== "main")
    .map((branch) => ({
      branch,
      ...scoreBranch(branch),
    }))
    .sort((a, b) => b.score - a.score)[0];
}
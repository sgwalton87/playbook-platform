import {
  createValidationPlan,
  createValidationPlanner,
} from "./planner";

import { validateRepository } from "./repository";
import lintValidationAdapter from "./lint";
import typeScriptValidationAdapter from "./typescript";
import buildValidationAdapter from "./build";

export const defaultValidationPlan =
  createValidationPlan([
    {
      id: "repository",
      name: "Repository Validation",
      description:
        "Validates repository configuration and governance.",

      async check() {
        return await validateRepository();
      },
    },
  ]);

export const defaultValidationPlanner =
  createValidationPlanner(
    defaultValidationPlan
  );

export const defaultValidationAdapters = [
  ...defaultValidationPlanner.createAdapters(),
  lintValidationAdapter,
  typeScriptValidationAdapter,
  buildValidationAdapter,
] as const;

export default defaultValidationPlanner;

import { loadRuntimeArtifact } from "./state";

import { PBOSWorld } from "./types";

export function buildWorld(): PBOSWorld {

  return {

    generatedAt: new Date().toISOString(),

    repository: loadRuntimeArtifact(
      "pbos/runtime/repository.json"
    ),

    planning: loadRuntimeArtifact(
      "pbos/runtime/next-gate.json"
    ),

    validation: loadRuntimeArtifact(
      "pbos/runtime/validation.json"
    ),

    execution: loadRuntimeArtifact(
      "pbos/runtime/execution.json"
    ),

    workflow: loadRuntimeArtifact(
      "pbos/runtime/workflow.json"
    ),

    doctor: loadRuntimeArtifact(
      "pbos/runtime/doctor.json"
    ),

  };

}

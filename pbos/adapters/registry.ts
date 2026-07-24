import { access } from "node:fs/promises";
import * as path from "node:path";
import type { PbosAdapter } from "./types";

const planningSafeExecutionAdapter: PbosAdapter = {
  id: "PlanningSafeExecutionAdapter",
  stage: "execution",
  async run() {
    return {
      id: "PlanningSafeExecutionAdapter",
      stage: "execution",
      passed: true,
      message: "Execution adapter remained planning-safe and did not modify application code.",
    };
  },
};

const documentationAdapter: PbosAdapter = {
  id: "DocumentationAdapter",
  stage: "documentation",
  async run() {
    return {
      id: "DocumentationAdapter",
      stage: "documentation",
      passed: true,
      message: "Documentation updates are delegated to PBOS docs and release-evidence writers.",
    };
  },
};

const releaseEvidenceAdapter: PbosAdapter = {
  id: "ReleaseEvidenceAdapter",
  stage: "releaseEvidence",
  async run({ config, rootDir }) {
    const reportsDirectory = path.join(rootDir, config.reportsDirectory);
    try {
      await access(reportsDirectory);
      return {
        id: "ReleaseEvidenceAdapter",
        stage: "releaseEvidence",
        passed: true,
        message: `Release evidence directory is available at ${config.reportsDirectory}.`,
      };
    } catch {
      return {
        id: "ReleaseEvidenceAdapter",
        stage: "releaseEvidence",
        passed: false,
        message: `Release evidence directory is missing at ${config.reportsDirectory}.`,
      };
    }
  },
};

export class AdapterRegistry {
  private readonly adapters: PbosAdapter[] = [planningSafeExecutionAdapter, documentationAdapter, releaseEvidenceAdapter];

  all(): PbosAdapter[] {
    return [...this.adapters];
  }

  byStage(stage: PbosAdapter["stage"]): PbosAdapter[] {
    return this.adapters.filter((adapter) => adapter.stage === stage);
  }

  count(): number {
    return this.adapters.length;
  }
}

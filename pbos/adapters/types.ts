import type { ExecutionReport, PbosConfig, ValidationResult } from "../engine/types";

export type AdapterStage =
  | "validation"
  | "execution"
  | "verification"
  | "documentation"
  | "history"
  | "ledger"
  | "releaseEvidence"
  | "reporting"
  | "recommendation";

export interface AdapterContext {
  config: PbosConfig;
  rootDir: string;
  report?: ExecutionReport;
}

export interface AdapterResult {
  id: string;
  stage: AdapterStage;
  passed: boolean;
  message: string;
  validation?: ValidationResult;
}

export interface PbosAdapter {
  id: string;
  stage: AdapterStage;
  run(context: AdapterContext): Promise<AdapterResult>;
}

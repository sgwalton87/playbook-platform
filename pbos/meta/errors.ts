import type { MetaFailure, MetaFailureCode } from "./contracts";

export class MetaIntelligenceError extends Error {
  constructor(public readonly failures: MetaFailure[]) {
    super(failures.map((failure) => `${failure.code}: ${failure.message}`).join("; "));
    this.name = "MetaIntelligenceError";
  }
}

export const metaFailure = (code: MetaFailureCode, message: string): MetaFailure => ({ code, message });

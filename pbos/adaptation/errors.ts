import type { AdaptationFailure, AdaptationFailureCode } from "./contracts";

export class AdaptationError extends Error {
  constructor(public readonly failures: AdaptationFailure[]) {
    super(failures.map((failure) => `${failure.code}: ${failure.message}`).join("; "));
    this.name = "AdaptationError";
  }
}

export const adaptationFailure = (code: AdaptationFailureCode, message: string): AdaptationFailure => ({ code, message });

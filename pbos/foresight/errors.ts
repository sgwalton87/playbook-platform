import type { ForesightFailure, ForesightFailureCode } from "./contracts";

export class ForesightError extends Error {
  constructor(public readonly failures: ForesightFailure[]) {
    super(failures.map(({ code, message }) => `${code}: ${message}`).join("; "));
    this.name = "ForesightError";
  }
}

export function foresightFailure(code: ForesightFailureCode, message: string): ForesightFailure {
  return { code, message };
}

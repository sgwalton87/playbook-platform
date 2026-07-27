import type { AthleticFailure, AthleticFailureCode } from "./contracts";
export class AthleticError extends Error {
  constructor(public readonly failures: AthleticFailure[]) {
    super(failures.map(({ code, message }) => `${code}: ${message}`).join("; "));
    this.name = "AthleticError";
  }
}
export const athleticFailure = (code: AthleticFailureCode, message: string): AthleticFailure => ({ code, message });

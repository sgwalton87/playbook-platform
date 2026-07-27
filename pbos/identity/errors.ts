import type { IdentityFailure, IdentityFailureCode } from "./contracts";
export class IdentityError extends Error {
  constructor(public readonly failures: IdentityFailure[]) {
    super(failures.map(({ code, message }) => `${code}: ${message}`).join("; "));
    this.name = "IdentityError";
  }
}
export const identityFailure = (code: IdentityFailureCode, message: string): IdentityFailure => ({ code, message });

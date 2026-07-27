import type { RoleFailure, RoleFailureCode } from "./contracts";
export class RoleError extends Error {
  constructor(public readonly failures: RoleFailure[]) {
    super(failures.map(({ code, message }) => `${code}: ${message}`).join("; "));
    this.name = "RoleError";
  }
}
export const roleFailure = (code: RoleFailureCode, message: string): RoleFailure => ({ code, message });

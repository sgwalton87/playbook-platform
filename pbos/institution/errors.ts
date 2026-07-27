import type { InstitutionFailure, InstitutionFailureCode } from "./contracts";
export class InstitutionError extends Error { constructor(public readonly failures: InstitutionFailure[]) { super(failures.map(({ message }) => message).join("; ")); this.name = "InstitutionError"; } }
export const institutionFailure = (code: InstitutionFailureCode, message: string): InstitutionFailure => ({ code, message });

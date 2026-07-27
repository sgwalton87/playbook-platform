import type { AcademicFailure, AcademicFailureCode } from "./contracts";
export class AcademicError extends Error { constructor(public readonly failures: AcademicFailure[]) { super(failures.map(({ code, message }) => `${code}: ${message}`).join("; ")); this.name = "AcademicError"; } }
export const academicFailure = (code: AcademicFailureCode, message: string): AcademicFailure => ({ code, message });

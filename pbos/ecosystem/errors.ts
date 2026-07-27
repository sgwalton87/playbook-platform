import type { EcosystemFailure, EcosystemFailureCode } from "./contracts";
export class EcosystemError extends Error { constructor(public readonly failures: EcosystemFailure[]) { super(failures.map(({ code, message }) => `${code}: ${message}`).join("; ")); this.name = "EcosystemError"; } }
export const ecosystemFailure = (code: EcosystemFailureCode, message: string): EcosystemFailure => ({ code, message });

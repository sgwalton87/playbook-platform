import type { MasteryFailure, MasteryFailureCode } from "./contracts";
export class MasteryError extends Error { constructor(public readonly failures: MasteryFailure[]) { super(failures.map(({ code, message }) => `${code}: ${message}`).join("; ")); this.name = "MasteryError"; } }
export const masteryFailure = (code: MasteryFailureCode, message: string): MasteryFailure => ({ code, message });

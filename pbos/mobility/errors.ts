import type { MobilityFailure, MobilityFailureCode } from "./contracts";
export class MobilityError extends Error { constructor(public readonly failures: MobilityFailure[]) { super(failures.map(({ message }) => message).join("; ")); this.name = "MobilityError"; } }
export const mobilityFailure = (code: MobilityFailureCode, message: string): MobilityFailure => ({ code, message });

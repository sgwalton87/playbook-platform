import type { CommunicationFailure, CommunicationFailureCode } from "./contracts";
export class CommunicationError extends Error { constructor(public readonly failures: CommunicationFailure[]) { super(failures.map(({ message }) => message).join("; ")); this.name = "CommunicationError"; } }
export const communicationFailure = (code: CommunicationFailureCode, message: string): CommunicationFailure => ({ code, message });

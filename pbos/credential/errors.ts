import type { CredentialFailure, CredentialFailureCode } from "./contracts";
export class CredentialError extends Error { constructor(public readonly failures: CredentialFailure[]) { super(failures.map(({ code, message }) => `${code}: ${message}`).join("; ")); this.name = "CredentialError"; } }
export const credentialFailure = (code: CredentialFailureCode, message: string): CredentialFailure => ({ code, message });

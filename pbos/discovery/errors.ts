import type { DiscoveryFailure, DiscoveryFailureCode } from "./governed-contracts";

export class DiscoveryError extends Error {
  constructor(public readonly failures: DiscoveryFailure[]) {
    super(failures.map(({ code, message }) => `${code}: ${message}`).join("; "));
    this.name = "DiscoveryError";
  }
}

export const discoveryFailure = (code: DiscoveryFailureCode, message: string): DiscoveryFailure => ({ code, message });

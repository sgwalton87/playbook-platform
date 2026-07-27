import type { StrategyFailure, StrategyFailureCode } from "./contracts";

export class StrategyError extends Error {
  constructor(public readonly failures: StrategyFailure[]) {
    super(failures.map(({ code, message }) => `${code}: ${message}`).join("; "));
    this.name = "StrategyError";
  }
}

export const strategyFailure = (code: StrategyFailureCode, message: string): StrategyFailure => ({ code, message });

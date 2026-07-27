import type { PortfolioFailure, PortfolioFailureCode } from "./contracts";
export class PortfolioError extends Error {
  constructor(public readonly failures: PortfolioFailure[]) {
    super(failures.map(({ code, message }) => `${code}: ${message}`).join("; "));
    this.name = "PortfolioError";
  }
}
export const portfolioFailure = (code: PortfolioFailureCode, message: string): PortfolioFailure => ({ code, message });

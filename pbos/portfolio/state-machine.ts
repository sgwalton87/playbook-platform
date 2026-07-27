import type { PortfolioLifecycleState, PortfolioState } from "./contracts";
import { PortfolioError, portfolioFailure } from "./errors";
const next: Record<PortfolioState, PortfolioState[]> = { CREATED: ["BUILDING"], BUILDING: ["CURATING"], CURATING: ["REVIEWING"], REVIEWING: ["SHARING_AUTHORIZED", "ARCHIVED"], SHARING_AUTHORIZED: ["PRESENTED", "ARCHIVED"], PRESENTED: ["ARCHIVED"], ARCHIVED: [] };
export function transitionPortfolio(state: PortfolioLifecycleState, to: PortfolioState, transitionedAt: string, authorityIdentity: string, evidenceReferences: string[]): PortfolioLifecycleState {
  if (!next[state.currentState].includes(to)) throw new PortfolioError([portfolioFailure("INVALID_TRANSITION", `Cannot transition from ${state.currentState} to ${to}.`)]);
  if (["REVIEWING", "SHARING_AUTHORIZED", "PRESENTED", "ARCHIVED"].includes(to) && (!authorityIdentity || !evidenceReferences.length)) throw new PortfolioError([portfolioFailure("GOVERNANCE_BYPASS", "Review, sharing, presentation, and archival require human authority and evidence.")]);
  if (Number.isNaN(Date.parse(transitionedAt))) throw new PortfolioError([portfolioFailure("MISSING_EVIDENCE", "Lifecycle transitions require a valid timestamp.")]);
  return { currentState: to, transitions: [...state.transitions, { from: state.currentState, to, transitionedAt, authorityIdentity, evidenceReferences: [...evidenceReferences].sort() }] };
}

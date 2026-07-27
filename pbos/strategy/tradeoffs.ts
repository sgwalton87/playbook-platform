import type { StrategyOptionCandidate, TradeoffAnalysis } from "./contracts";

export function analyzeTradeoffs(candidate: StrategyOptionCandidate): TradeoffAnalysis {
  return { benefits: [...candidate.benefits].sort(), risks: [...candidate.risks].sort(), resourceRequirements: [...candidate.requiredResources].sort(), opportunityCosts: [...candidate.opportunityCosts].sort(), dependencies: [...candidate.dependencies].sort(), affectedStakeholders: [...candidate.affectedStakeholders].sort(), uncertaintyStatement: "Benefits and possible outcomes are scenarios, not guarantees; success and causation are not predicted." };
}

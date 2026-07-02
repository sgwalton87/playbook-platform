import { calculatePortfolioStats } from "./stats";
import { calculatePortfolioCompletion } from "./completion";
import { calculatePortfolioDNA } from "./dna";

export function buildPortfolioIntelligence(input: any) {
  return {
    stats: calculatePortfolioStats(input),
    completion: calculatePortfolioCompletion(input.portfolio),
    dna: calculatePortfolioDNA(input),
  };
}

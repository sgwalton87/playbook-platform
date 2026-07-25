export interface DecisionOption {
  id: string;
  title: string;
  score: number;
  reasons: string[];
}

export interface DecisionResult {
  generatedAt: string;
  winner: DecisionOption;
  candidates: DecisionOption[];
}

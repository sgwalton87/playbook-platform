export type TrustLevel =
  | "activity"
  | "achievement"
  | "evidence"
  | "verification"
  | "outcome"
  | "impact";

export interface TrustSignal {
  id: string;
  label: string;
  level: TrustLevel;
  points: number;
  verified?: boolean;
}

export interface TrustReport {
  score: number;
  level: TrustLevel;
  signals: TrustSignal[];
  missing: string[];
}

export type OracleQueryType =
  | "opportunities"
  | "academic"
  | "trust"
  | "records"
  | "unknown";

export interface OracleQuery {
  text: string;
  type: OracleQueryType;
}

export interface OracleAnswer {
  query: string;
  type: OracleQueryType;
  answer: string;
  evidence: string[];
  nextActions: string[];
}

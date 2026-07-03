import type { OracleQueryType } from "./types";

export function classifyOracleQuery(text: string): OracleQueryType {
  const q = text.toLowerCase();

  if (q.includes("opportun") || q.includes("scholarship") || q.includes("mentor")) return "opportunities";
  if (q.includes("course") || q.includes("transcript") || q.includes("a-g") || q.includes("gpa")) return "academic";
  if (q.includes("trust") || q.includes("verified") || q.includes("evidence")) return "trust";
  if (q.includes("record") || q.includes("achievement")) return "records";

  return "unknown";
}

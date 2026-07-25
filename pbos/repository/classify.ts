import { BranchInfo } from "./types";

export function classifyBranch(branch: BranchInfo): string {

  const n = branch.name.toLowerCase();

  if (n === "main") return "Production";

  if (n.startsWith("integration/")) return "Integration";

  if (n.startsWith("backup/")) return "Backup";

  if (n.startsWith("recovery/")) return "Recovery";

  if (n.startsWith("docs/")) return "Documentation";

  if (n.startsWith("feature/")) return "Feature";

  if (n.startsWith("agent/")) return "Agent";

  return "Unknown";
}

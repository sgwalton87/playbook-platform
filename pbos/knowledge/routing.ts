import type { KnowledgeAuthorityChange } from "./governed-contracts";
const routes: Record<KnowledgeAuthorityChange, string> = { classification: "knowledge-governance", "historical-interpretation": "historical-governance", ownership: "ownership-authority", "deletion-archival": "records-governance", "authoritative-lesson": "institutional-governance" };
export const routeKnowledgeGovernance = (changes: KnowledgeAuthorityChange[]): string[] => [...new Set(changes.map((change) => routes[change]))].sort();

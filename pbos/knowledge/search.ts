import { KnowledgeGraph } from "./types";

export function searchKnowledge(
  graph: KnowledgeGraph,
  query: string
) {

  const q = query.toLowerCase();

  return graph.documents.filter(doc =>
    doc.content.toLowerCase().includes(q)
  );

}

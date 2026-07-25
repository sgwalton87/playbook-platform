import { KnowledgeGraph } from "./types";
import { loadKnowledgeDocuments } from "./loader";

export function buildKnowledgeGraph(): KnowledgeGraph {

  const documents = loadKnowledgeDocuments();

  return {
    generatedAt: new Date().toISOString(),
    documents,
    nodes: [],
    edges: [],
  };

}

export interface KnowledgeDocument {
  id: string;
  path: string;
  title: string;
  content: string;
}

export interface KnowledgeNode {
  id: string;
  type: string;
  name: string;
  source: string;
}

export interface KnowledgeEdge {
  from: string;
  to: string;
  relationship: string;
}

export interface KnowledgeGraph {
  generatedAt: string;
  documents: KnowledgeDocument[];
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

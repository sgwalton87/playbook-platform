import { KnowledgeDocument } from "./types";

export function parseDocument(
  document: KnowledgeDocument
) {
  return {
    ...document,
    headings: document.content
      .split("\n")
      .filter(line => line.startsWith("#")),
  };
}

import fs from "fs";
import path from "path";

import { KnowledgeDocument } from "./types";

function walk(dir: string): string[] {

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  let files: string[] = [];

  for (const entry of entries) {

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else if (entry.name.endsWith(".md")) {
      files.push(full);
    }

  }

  return files;

}

export function loadKnowledgeDocuments(
  root = "docs"
): KnowledgeDocument[] {

  if (!fs.existsSync(root)) {
    return [];
  }

  return walk(root).map(file => ({
    id: file,
    path: file,
    title: path.basename(file),
    content: fs.readFileSync(file, "utf8"),
  }));

}

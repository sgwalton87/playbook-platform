import fs from "fs";
import path from "path";
import { inferDocMetadata } from "./DocMetadata";

const ROOT = process.cwd();
const DOC_ROOT = path.join(ROOT, "docs");
const IGNORE = [".next", "node_modules", ".git", "coverage", "dist", "build"];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir).flatMap((item) => {
    if (IGNORE.includes(item)) return [];

    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) return walk(full);

    return full.endsWith(".md") ? [full.replace(ROOT + "/", "")] : [];
  });
}

export function scanDocs() {
  const files = walk(DOC_ROOT);

  return files.map((file) => {
    const content = fs.readFileSync(file, "utf8");
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const metadata = inferDocMetadata(file, content);
    const modifiedAt = fs.statSync(file).mtime;

    return {
      file,
      content,
      words,
      modifiedAt,
      metadata,
      isThin: words < 40 && metadata.status !== "generated" && metadata.status !== "frozen",
      isGenerated: metadata.status === "generated",
      isFrozen: metadata.status === "frozen",
      isCanonical: metadata.canonical,
    };
  });
}

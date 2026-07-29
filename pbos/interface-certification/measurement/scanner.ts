import { createHash } from "node:crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import path from "node:path";
import type { ScannedInterfaceFile } from "./measurement-types";

const INTERFACE_ROOTS = [
  "app",
  "components",
  "lib/design-system",
  "lib/navigation",
  "styles",
] as const;

function walk(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }
  return readdirSync(directory, { withFileTypes: true }).flatMap(
    (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return walk(entryPath);
      }
      return entry.isFile() &&
        /\.(css|json|md|ts|tsx)$/.test(entry.name)
        ? [entryPath]
        : [];
    }
  );
}

export function scanInterfaceImplementation(
  rootDir = process.cwd()
): ScannedInterfaceFile[] {
  return INTERFACE_ROOTS.flatMap((root) =>
    walk(path.join(rootDir, root))
  )
    .sort()
    .map((filePath) => {
      const content = readFileSync(filePath, "utf8");
      return {
        path: path
          .relative(rootDir, filePath)
          .replaceAll("\\", "/"),
        digest: createHash("sha256").update(content).digest("hex"),
        content,
      };
    });
}

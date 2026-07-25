import fs from "fs";
import path from "path";

export function scanRepository(root: string): string[] {

  const files: string[] = [];

  function walk(dir: string) {

    for (const item of fs.readdirSync(dir)) {

      if (
        item === ".git" ||
        item === "node_modules" ||
        item === ".next"
      ) {
        continue;
      }

      const full = path.join(dir, item);

      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else {
        files.push(full);
      }
    }

  }

  walk(root);

  return files;
}

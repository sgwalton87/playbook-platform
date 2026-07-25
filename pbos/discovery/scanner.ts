import fs from "fs";
import path from "path";

export function scanDirectory(root: string): string[] {

  if (!fs.existsSync(root)) {
    return [];
  }

  const output: string[] = [];

  function walk(dir: string) {

    const entries = fs.readdirSync(dir, {
      withFileTypes: true,
    });

    for (const entry of entries) {

      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(full);
      } else {
        output.push(full);
      }

    }

  }

  walk(root);

  return output;

}

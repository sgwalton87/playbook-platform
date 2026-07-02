import fs from "fs";
import path from "path";

export function appendDoc(file: string, title: string, entry: string) {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `# ${title}\n\n`);
  }

  fs.appendFileSync(file, `\n${entry}\n`);
}

export function writeDoc(file: string, content: string) {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content);
}

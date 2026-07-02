import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir).flatMap((item) => {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(item)) return [];
      return walk(full);
    }

    return [full.replace(ROOT + "/", "")];
  });
}

export function scanProject() {
  const files = walk(ROOT);

  return {
    files,
    engines: files.filter((f) => f.includes("lib/engines/") || f.includes("lib/compass/") || f.includes("lib/academic-intelligence/") || f.includes("lib/opportunity-graph/")),
    repositories: files.filter((f) => f.includes("lib/repositories/")),
    events: files.filter((f) => f.includes("lib/events/")),
    sdk: files.filter((f) => f.includes("lib/playbook/")),
    components: files.filter((f) => f.includes("components/")),
    pages: files.filter((f) => f.includes("app/") && f.endsWith("page.tsx")),
    migrations: files.filter((f) => f.includes("supabase/migrations/")),
    tests: files.filter((f) => f.includes("tests/")),
    docs: files.filter((f) => f.includes("docs/")),
  };
}

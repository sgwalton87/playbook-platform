import fs from "fs";
import path from "path";
import type { RepositoryModel } from "./model/RepositoryModel";

const ROOT = process.cwd();

const IGNORE = new Set([
  ".git",
  ".next",
  "node_modules",
  ".vercel",
  "coverage",
  "dist",
]);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir).flatMap((item) => {
    if (IGNORE.has(item)) return [];

    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      return walk(full);
    }

    return [full.replace(ROOT + "/", "")];
  });
}

export function scanProject(): RepositoryModel {
  const files = walk(ROOT);

  return {
    files,

    pages: files.filter(f => f.startsWith("app/") && f.endsWith("page.tsx")),

    components: files.filter(f => f.startsWith("components/")),

    libraries: files.filter(f => f.startsWith("lib/")),

    engines: files.filter(f =>
      f.includes("engines") ||
      f.includes("compass") ||
      f.includes("academic-intelligence") ||
      f.includes("opportunity-graph")
    ),

    repositories: files.filter(f => f.includes("repositories")),

    events: files.filter(f => f.includes("events")),

    migrations: files.filter(f => f.includes("supabase/migrations")),

    tests: files.filter(f =>
      f.includes("tests") ||
      f.endsWith(".test.ts") ||
      f.endsWith(".spec.ts")
    ),

    docs: files.filter(f => f.startsWith("docs/")),

    apiRoutes: files.filter(f =>
      f.startsWith("app/api/") &&
      (f.endsWith("route.ts") || f.endsWith("route.tsx"))
    ),

    layouts: files.filter(f => f.endsWith("layout.tsx")),

    middleware: files.filter(f => f.endsWith("middleware.ts")),

    hooks: files.filter(f =>
      f.includes("/hooks/") ||
      path.basename(f).startsWith("use")
    ),

    contexts: files.filter(f =>
      f.includes("/context") ||
      f.includes("/contexts")
    ),

    workers: files.filter(f => f.startsWith("workers/")),
  };
}

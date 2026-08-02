import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { evaluateRlsContract } from "../lib/release/rlsContract";

const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
const migrationFiles = readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort();
const sql = migrationFiles
  .map((file) => readFileSync(join(migrationsDirectory, file), "utf8"))
  .join("\n");
const findings = evaluateRlsContract(sql);

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(`RLS ${finding.issue}: public.${finding.table}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `RLS structural contract valid across ${migrationFiles.length} migrations.`,
  );
}

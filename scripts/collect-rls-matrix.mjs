#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase", "migrations");
const OUTPUT_FILE = path.resolve(
  process.cwd(),
  "docs",
  "release-evidence",
  "pbos-rls-001-matrix.json",
);

const files = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((file) => file.endsWith(".sql"))
  .sort();

let allSql = "";
for (const file of files) {
  allSql += `\n-- ${file}\n`;
  allSql += fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
}

const enabledTables = [
  ...new Set(
    [...allSql.matchAll(/ALTER TABLE public\.([A-Za-z0-9_]+)\s+ENABLE ROW LEVEL SECURITY/gi)].map(
      (match) => match[1],
    ),
  ),
].sort();

const statementPattern =
  /(drop policy if exists|create policy)\s+"([^"]+)"\s+on\s+public\.([A-Za-z0-9_]+)/gi;
const policyEntriesByTable = new Map();

for (const table of enabledTables) {
  policyEntriesByTable.set(table, new Map());
}

for (const match of allSql.matchAll(statementPattern)) {
  const [, action, policyName, table] = match;

  if (!policyEntriesByTable.has(table)) {
    policyEntriesByTable.set(table, new Map());
  }

  if (action.toLowerCase().startsWith("drop")) {
    policyEntriesByTable.get(table)?.delete(policyName);
    continue;
  }

  policyEntriesByTable.get(table)?.set(policyName, {
    name: policyName,
    index: match.index ?? 0,
  });
}

const matrix = enabledTables.map((table) => {
  const policies = [
    ...((policyEntriesByTable.get(table) ?? new Map()).values()),
  ].sort((a, b) => a.index - b.index);

  return {
    table,
    rlsEnabled: true,
    policyCount: policies.length,
    policyNames: policies.map((policy) => policy.name),
  };
});

const missing = matrix.filter((item) => item.policyCount === 0).map((item) => item.table);

const artifact = {
  mission: "PBOS-RLS-001",
  generatedAt: new Date().toISOString(),
  source: {
    scope: "all files in supabase/migrations",
    countFiles: files.length,
    files,
  },
  summary: {
    rlsEnabledTables: enabledTables.length,
    tablesWithCreatePolicies: enabledTables.length - missing.length,
    policyStatements: [...policyEntriesByTable.values()].reduce(
      (count, policies) => count + policies.size,
      0,
    ),
    tablesMissingPolicies: missing.length,
  },
  missingPolicyTables: missing,
  matrix,
};

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`WROTE ${OUTPUT_FILE}`);
console.log(
  `rlsEnabledTables=${artifact.summary.rlsEnabledTables} tablesWithPolicies=${artifact.summary.tablesWithCreatePolicies} missing=${artifact.summary.tablesMissingPolicies}`,
);

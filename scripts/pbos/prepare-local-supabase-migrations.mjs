import { readdirSync, renameSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");
const VERSION_PATTERN = /^(\d+)_/;

function normalizedVersion(version, ordinal) {
  if (version.length >= 14) {
    throw new Error(`Cannot normalize duplicate migration version ${version}: version is already 14+ digits.`);
  }

  const suffixLength = 14 - version.length;
  const suffix = String(ordinal + 1).padStart(suffixLength, "0");
  if (suffix.length > suffixLength) {
    throw new Error(`Too many duplicate migrations for version ${version}.`);
  }
  return `${version}${suffix}`;
}

export function buildNormalizationPlan(fileNames) {
  const groups = new Map();

  for (const fileName of [...fileNames].sort()) {
    if (!fileName.endsWith(".sql")) continue;
    const match = fileName.match(VERSION_PATTERN);
    if (!match) continue;
    const version = match[1];
    const files = groups.get(version) ?? [];
    files.push(fileName);
    groups.set(version, files);
  }

  const plan = [];
  for (const [version, files] of groups.entries()) {
    if (files.length < 2) continue;
    files.sort();
    files.forEach((fileName, ordinal) => {
      const nextVersion = normalizedVersion(version, ordinal);
      plan.push({
        from: fileName,
        to: fileName.replace(VERSION_PATTERN, `${nextVersion}_`),
        originalVersion: version,
        normalizedVersion: nextVersion,
      });
    });
  }

  const replacementBySource = new Map(plan.map(item => [item.from, item.normalizedVersion]));
  const normalizedVersions = new Set();
  for (const [version, files] of groups) {
    for (const file of files) {
      const normalized = replacementBySource.get(file) ?? version;
      if (normalizedVersions.has(normalized)) {
        throw new Error(`Local migration version collision after normalization: ${normalized}.`);
      }
      normalizedVersions.add(normalized);
    }
  }
  return plan.sort((a, b) => a.from.localeCompare(b.from));
}

export function normalizeMigrationFiles(directory = MIGRATIONS_DIR) {
  const fileNames = readdirSync(directory);
  const plan = buildNormalizationPlan(fileNames);

  for (const item of plan) {
    renameSync(join(directory, item.from), join(directory, item.to));
    console.log(`[local-only migration normalization] ${item.from} -> ${item.to}`);
  }

  if (plan.length === 0) {
    console.log("[local-only migration normalization] no duplicate versions found");
  }

  return plan;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== "--workdir" || !args[1])) {
    throw new Error("Usage: node scripts/pbos/prepare-local-supabase-migrations.mjs [--workdir <disposable-project>]");
  }
  normalizeMigrationFiles(args.length ? join(resolve(args[1]), "supabase", "migrations") : MIGRATIONS_DIR);
}

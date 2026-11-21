// @vitest-environment node
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { buildNormalizationPlan, normalizeMigrationFiles } from "@/scripts/pbos/prepare-local-supabase-migrations.mjs";

const toolkit = [
  "20260704_application_toolkit_persistence.sql",
  "20260704_application_toolkit_rls.sql",
];

it("assigns distinct disposable IDs in dependency order while preserving SQL bytes", () => {
  const dir = mkdtempSync(join(tmpdir(), "pbos-migration-versions-"));
  toolkit.forEach((name, index) => writeFileSync(join(dir, name), String(index)));
  const planned = normalizeMigrationFiles(dir);
  expect(planned.map(item => item.normalizedVersion)).toEqual(["20260704000001", "20260704000002"]);
  expect(planned.map(item => readFileSync(join(dir, item.to), "utf8"))).toEqual(["0", "1"]);
  expect(buildNormalizationPlan(readdirSync(dir))).toEqual([]);
});

it("fails before any rename if a derived version collides with a tracked timestamp", () => {
  const dir = mkdtempSync(join(tmpdir(), "pbos-migration-collision-"));
  const names = [...toolkit, "20260704000001_existing.sql"].sort();
  names.forEach(name => writeFileSync(join(dir, name), name));
  expect(() => normalizeMigrationFiles(dir)).toThrow(/collision after normalization/);
  expect(readdirSync(dir).sort()).toEqual(names);
});

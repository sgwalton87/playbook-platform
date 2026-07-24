import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { CANONICAL_DOCUMENTS, CanonicalStateError, loadCanonicalState } from "../../pbos/canonical-state.mjs";

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

async function fixtureRoot() {
  const root = await mkdtemp(path.join(tmpdir(), "pbos-state-"));
  await mkdir(path.join(root, "docs", "PBOS"), { recursive: true });
  return root;
}

test("loads and parses exactly the five canonical documents from a repository root", async () => {
  const root = await fixtureRoot();
  for (const [index, file] of CANONICAL_DOCUMENTS.entries()) {
    await writeFile(path.join(root, "docs", "PBOS", file), `fixture_index: ${index}\n`);
  }
  const state = await loadCanonicalState(root);
  assert.deepEqual(Object.keys(state), CANONICAL_DOCUMENTS);
  assert.equal(state["validation-baseline.yaml"].fixture_index, 4);
});

test("reports every absent canonical document in stable order", async () => {
  const root = await fixtureRoot();
  await assert.rejects(loadCanonicalState(root), (error) => {
    assert.ok(error instanceof CanonicalStateError);
    assert.equal(error.code, "PBOS_CANONICAL_STATE_UNAVAILABLE");
    assert.deepEqual(error.issues, CANONICAL_DOCUMENTS.map((file) => ({ file, reason: "missing" })));
    return true;
  });
});

test("rejects invalid YAML instead of treating it as evidence", async () => {
  const root = await fixtureRoot();
  for (const file of CANONICAL_DOCUMENTS) {
    await writeFile(path.join(root, "docs", "PBOS", file), "valid: true\n");
  }
  await writeFile(path.join(root, "docs", "PBOS", "repository-health.yaml"), "broken: [\n");
  await assert.rejects(loadCanonicalState(root), (error) => {
    assert.match(error.message, /repository-health\.yaml: invalid YAML/);
    return true;
  });
});

for (const command of ["status", "next", "report"]) {
  test(`${command} fails closed identically when canonical state is absent`, async () => {
    await assert.rejects(
      execFileAsync(process.execPath, [path.join(repositoryRoot, "scripts", "pbos.mjs"), command], { cwd: tmpdir() }),
      (error) => {
        assert.equal(error.code, 1);
        assert.equal(error.stdout, "");
        assert.match(error.stderr, /^PBOS_CANONICAL_STATE_UNAVAILABLE\n/);
        for (const file of CANONICAL_DOCUMENTS) {
          assert.match(error.stderr, new RegExp(`- docs/PBOS/${file.replace(".", "\\.")}: missing`));
        }
        return true;
      },
    );
  });
}

import fs from "fs/promises";

const BASELINE_FILE = "devos/baseline/repository.json";

export async function loadBaseline() {
  try {
    const data = await fs.readFile(BASELINE_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveBaseline(report) {
  const baseline = {
    createdAt: new Date().toISOString(),
    ...report
  };

  await fs.writeFile(
    BASELINE_FILE,
    JSON.stringify(baseline, null, 2)
  );

  return baseline;
}

export function compareBaseline(current, baseline) {
  if (!baseline) {
    return {
      passed: true,
      reason: "No baseline exists."
    };
  }

  const lintRegression =
    !baseline.lint.passed &&
    !current.lint.passed &&
    (current.lint.errors > baseline.lint.errors);

  return {
    passed:
      current.typescript.passed &&
      current.build.passed &&
      !lintRegression,

    lintRegression,

    baseline,
    current
  };
}
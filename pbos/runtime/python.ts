import { spawnSync } from "node:child_process";

export function getPythonExecutable(): string {
  const candidates = ["python3", "python"];

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], {
      stdio: "ignore",
    });

    if (result.status === 0) {
      return candidate;
    }
  }

  throw new Error(
    "No Python interpreter found. Install Python 3 or add it to PATH."
  );
}
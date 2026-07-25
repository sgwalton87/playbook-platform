import { existsSync } from "node:fs";
import { join } from "node:path";

import type { DoctorCheck } from "./types";

export function checkFilesystem(): DoctorCheck {
  const kernelExists = existsSync(join(process.cwd(), "pbos", "kernel"));
  const runtimeExists = existsSync(join(process.cwd(), "pbos", "runtime"));

  const passed = kernelExists && runtimeExists;

  return {
    id: "filesystem",
    name: "Filesystem",
    status: passed ? "PASS" : "FAIL",
    message: passed
      ? "Kernel and runtime directories found."
      : "Missing kernel or runtime directory.",
  };
}

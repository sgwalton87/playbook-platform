import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GateDefinition } from "./types";

const GATES_DIRECTORY = "pbos/gates";

export function loadGates(): GateDefinition[] {
  const files = readdirSync(GATES_DIRECTORY)
    .filter((file) => file.endsWith(".json"));

  return files.map((file) => {
    const path = join(GATES_DIRECTORY, file);
    const contents = readFileSync(path, "utf8");

    return JSON.parse(contents) as GateDefinition;
  });
}
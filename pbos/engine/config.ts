import { readFile } from "node:fs/promises";
import * as path from "node:path";
import type { PbosConfig } from "./types";

export async function loadConfig(rootDir = process.cwd()): Promise<PbosConfig> {
  const configPath = path.join(rootDir, "pbos/config/pbos.config.json");
  const raw = await readFile(configPath, "utf8");
  return JSON.parse(raw) as PbosConfig;
}

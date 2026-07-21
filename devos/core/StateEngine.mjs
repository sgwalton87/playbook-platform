import { promises as fs } from "fs";
import path from "path";

const STATE_FILE = path.resolve("devos/state/currentMission.json");

async function ensureStateFile() {
  try {
    await fs.access(STATE_FILE);
  } catch {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, "{}\n");
  }
}

export async function loadMission() {
  await ensureStateFile();
  const raw = await fs.readFile(STATE_FILE, "utf8");
  return JSON.parse(raw || "{}");
}

export async function saveMission(mission) {
  await ensureStateFile();
  await fs.writeFile(
    STATE_FILE,
    JSON.stringify(mission, null, 2) + "\n"
  );
}

export async function clearMission() {
  await ensureStateFile();
  await fs.writeFile(STATE_FILE, "{}\n");
}

export async function hasMission() {
  const mission = await loadMission();
  return Object.keys(mission).length > 0;
}

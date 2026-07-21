import { promises as fs } from "fs";

const FILE = "devos/state/repositoryBaseline.json";

export async function loadBaseline() {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveBaseline(report) {
  await fs.writeFile(
    FILE,
    JSON.stringify(report, null, 2)
  );
}
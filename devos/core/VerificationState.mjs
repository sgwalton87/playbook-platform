import { promises as fs } from "fs";

const FILE = "devos/state/lastVerification.json";

export async function saveVerification(report) {
  await fs.writeFile(
    FILE,
    JSON.stringify(report, null, 2)
  );
}

export async function loadVerification() {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
import { promises as fs } from "fs";

const CHECKLIST = "docs/PLAYBOOK_MASTER_CHECKLIST.md";

export async function getNextMission() {
  const text = await fs.readFile(CHECKLIST, "utf8");

  const lines = text.split("\n");

  let started = false;
  let currentPhase = null;

  for (const line of lines) {

    // Ignore everything before the first phase heading
    if (!started) {
      if (line.startsWith("# Phase ")) {
        started = true;
        currentPhase = line;
      }
      continue;
    }

    if (line.startsWith("# Phase ")) {
      currentPhase = line;
      continue;
    }

    if (
      line.startsWith("- 🟥") ||
      line.startsWith("- 🟨") ||
      line.startsWith("- ⬜")
    ) {

      const title = line.substring(4).trim();

      return {
        id: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),

        phase: Number(currentPhase.match(/Phase (\d+)/)[1]),

        phaseTitle: currentPhase,

        title,

        status: line.substring(2, 3)
      };
    }
  }

  return null;
}

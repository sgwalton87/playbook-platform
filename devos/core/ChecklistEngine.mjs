import { promises as fs } from "fs";

const CHECKLIST = "docs/PLAYBOOK_MASTER_CHECKLIST.md";

async function updateMission(title, emoji) {
  let text = await fs.readFile(CHECKLIST, "utf8");

  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(
    `^- (🟥|🟨|🟦|🟩|⬜)\\s+${escaped}$`,
    "m"
  );

  text = text.replace(regex, `- ${emoji} ${title}`);

  await fs.writeFile(CHECKLIST, text);
}

export function markImplementing(title) {
  return updateMission(title, "🟨");
}

export function markTesting(title) {
  return updateMission(title, "🟦");
}

export function markAccepted(title) {
  return updateMission(title, "🟩");
}
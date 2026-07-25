import { orchestrate } from "./orchestrator";

async function main() {
  console.clear();

  console.log("");
  console.log("====================================");
  console.log("      PLAYBOOK OPERATING SYSTEM");
  console.log("====================================");
  console.log("");

  const result = await orchestrate();

  console.log("");
  console.log("Runtime Complete");
  console.log("");

  console.dir(result, {
    depth: null,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
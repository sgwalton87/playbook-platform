import {
  getEngineRegistry,
  resolveExecutionGraph,
  sortExecutionGraph,
  validateRegistry,
} from "../registry";

export function runPBOS() {

  console.log("");
  console.log("===================================");
  console.log("PBOS ENGINE v0.4");
  console.log("Dynamic Scheduler");
  console.log("===================================");
  console.log("");

  const errors = validateRegistry();

  if (errors.length > 0) {

    console.error("Registry validation failed:");

    for (const error of errors) {
      console.error(`  • ${error}`);
    }

    process.exit(1);
  }

  const registry = getEngineRegistry();

  const graph = resolveExecutionGraph();

  const executionOrder =
    sortExecutionGraph(graph);

  console.log("Execution Plan");
  console.log("--------------");

  executionOrder.forEach((id, index) => {
    console.log(`${index + 1}. ${id}`);
  });

  console.log("");

  for (const id of executionOrder) {

    const engine = registry.find(
      e => e.id === id
    );

    if (!engine) {
      throw new Error(
        `Engine "${id}" not found.`
      );
    }

    console.log("===================================");
    console.log(`[${engine.id}] ${engine.name}`);
    console.log("===================================");
    console.log("");

    engine.run();

    console.log("");
  }

  console.log("===================================");
  console.log("PBOS RUN COMPLETE");
  console.log("===================================");
}

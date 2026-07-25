import { getEngineRegistry } from "../registry";

export function runPBOS() {
  console.log("");
  console.log("===================================");
  console.log("PBOS ENGINE v0.2");
  console.log("RUN IT!");
  console.log("===================================");
  console.log("");

  const registry = getEngineRegistry();

  console.log(`Engines Loaded : ${registry.length}`);
  console.log("");

  for (const engine of registry) {
    console.log("===================================");
    console.log(
      `[${engine.order}] ${engine.name} (${engine.id})`
    );
    console.log("===================================");
    console.log("");

    engine.run();

    console.log("");
  }

  console.log("===================================");
  console.log("PBOS RUN COMPLETE");
  console.log("===================================");
}

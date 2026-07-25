import { loadGates } from "./planner/load";

const gates = loadGates();

console.log(`Loaded ${gates.length} gate(s).\n`);

for (const gate of gates) {
  console.log(`${gate.id} | ${gate.status} | Priority ${gate.priority}`);
}
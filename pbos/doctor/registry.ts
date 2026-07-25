import { ENGINE_REGISTRY } from "../registry/engines";
import type { DoctorCheck } from "./types";

export function checkRegistry(): DoctorCheck {
  const ids = new Set<string>();

  let duplicate = false;

  for (const engine of ENGINE_REGISTRY) {
    if (ids.has(engine.id)) {
      duplicate = true;
      break;
    }

    ids.add(engine.id);
  }

  return {
    id: "registry",
    name: "Engine Registry",
    status: duplicate ? "FAIL" : "PASS",
    message: duplicate
      ? "Duplicate engine IDs detected."
      : `${ENGINE_REGISTRY.length} engines registered.`,
  };
}

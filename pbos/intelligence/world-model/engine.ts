import { artifactDigest } from "../../kernel/identity";
import type { WorldStateSnapshot } from "./types";

export function buildWorldStateSnapshot(
  input: Omit<WorldStateSnapshot, "confidence" | "digest">
): WorldStateSnapshot {
  const entities = [...input.entities].sort((a, b) => a.id.localeCompare(b.id));
  const ids = new Set(entities.map(({ id }) => id));
  if (
    ids.size !== entities.length ||
    entities.some(({ evidence }) => evidence.length === 0)
  ) {
    throw new Error("World model entity identity or evidence is invalid.");
  }
  const relationships = [...input.relationships].sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  if (
    relationships.some(
      ({ from, to, evidence }) =>
        !ids.has(from) || !ids.has(to) || evidence.length === 0
    )
  ) {
    throw new Error("World model relationship is unresolved.");
  }
  const body: WorldStateSnapshot = {
    ...input,
    entities,
    relationships,
    dependencies: [...input.dependencies].sort((a, b) =>
      `${a.source_id}:${a.target_id}`.localeCompare(
        `${b.source_id}:${b.target_id}`
      )
    ),
    confidence: Math.min(
      100,
      Math.round(
        (entities.filter(({ evidence }) => evidence.length > 0).length /
          Math.max(1, entities.length)) *
          100
      )
    ),
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}

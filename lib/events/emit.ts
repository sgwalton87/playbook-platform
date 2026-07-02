import { publishEvent } from "./bus";
import type { PlaybookEventType } from "./types";

export async function emitEvent<TPayload = any>({
  type,
  payload,
  source = "playbook",
}: {
  type: PlaybookEventType;
  payload: TPayload;
  source?: string;
}) {
  return publishEvent({
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    payload,
    source,
    createdAt: new Date().toISOString(),
  });
}

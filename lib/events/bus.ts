import type { PlaybookEvent, PlaybookEventType } from "./types";

type Handler = (event: PlaybookEvent) => Promise<void> | void;

const handlers = new Map<PlaybookEventType, Handler[]>();

export function onEvent(type: PlaybookEventType, handler: Handler) {
  const existing = handlers.get(type) || [];
  handlers.set(type, [...existing, handler]);
}

export async function publishEvent(event: PlaybookEvent) {
  const subscribers = handlers.get(event.type) || [];

  for (const handler of subscribers) {
    await handler(event);
  }

  return event;
}

export function clearEventHandlers() {
  handlers.clear();
}

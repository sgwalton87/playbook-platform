import type { EventType } from "../enums/EventType";

export interface TimelineEvent {
  id: string;
  type: EventType;
  occurredAt: string;
  title: string;
  description?: string;
}

import { digestValue } from "../context";
import type { CredentialHistoryEvent } from "./contracts";
export function preserveCredentialHistory(events: CredentialHistoryEvent[]): CredentialHistoryEvent[] { return events.map((event) => ({ ...event, eventId: event.eventId || `PBOS-CRED-EVT-${digestValue({ ...event, eventId: undefined }).slice(0, 16).toUpperCase()}`, evidenceReferences: [...event.evidenceReferences].sort(), preserved: true as const })).sort((a, b) => `${a.occurredAt}:${a.eventId}`.localeCompare(`${b.occurredAt}:${b.eventId}`)); }

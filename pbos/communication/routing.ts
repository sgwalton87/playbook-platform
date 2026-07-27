import type { MessageDraft } from "./contracts";
export function routeCommunicationGovernance(message: MessageDraft): string[] { return [...new Set([message.external ? "HUMAN_EXTERNAL_COMMUNICATION_APPROVAL" : "AUTHORIZED_RELATIONSHIP_DELIVERY", message.sensitive ? "HUMAN_SENSITIVE_COMMUNICATION_APPROVAL" : "PRIVACY_AND_CONSENT_ENFORCEMENT"])].sort(); }

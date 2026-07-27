import { digestValue, type PBOSRuntimeContext } from "../context";
import type { CommunicationInput, CommunicationParticipant, MessageDraft } from "./contracts";
import { CommunicationError, communicationFailure } from "./errors";

function validContext(context: PBOSRuntimeContext): boolean { const body = { ...context }; delete (body as Partial<PBOSRuntimeContext>).contextDigest; return context.documentInventory.length > 0 && context.contextDigest === digestValue(body); }
function fail(code: Parameters<typeof communicationFailure>[0], message: string): never { throw new CommunicationError([communicationFailure(code, message)]); }
export function validateCommunicationInput(input: CommunicationInput): PBOSRuntimeContext {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) fail("INVALID_CONTEXT", "A valid Runtime Context is required.");
  const context = input.runtimeContext as PBOSRuntimeContext;
  if (input.inferredRelationshipRequested) fail("INVALID_RELATIONSHIP", "Relationships cannot be inferred.");
  if (input.impersonationRequested) fail("IMPERSONATION", "PBOS cannot impersonate a participant.");
  if (input.privacyBypassRequested) fail("PRIVACY_VIOLATION", "Private communication cannot bypass visibility controls.");
  if (input.spamRequested) fail("SPAM_PROHIBITED", "Bulk or repeated unsolicited communication is prohibited.");
  if (input.manipulationRequested) fail("MANIPULATION_PROHIBITED", "Manipulative communication is prohibited.");
  if (Number.isNaN(Date.parse(input.generatedAt))) fail("MISSING_EVIDENCE", "A valid generation timestamp is required.");
  const digest = context.contextDigest;
  if ([...input.identityReports, ...input.roleReports, ...input.ecosystemReports].some((report) => report.runtimeContextDigest !== digest)) fail("PRIVACY_VIOLATION", "All inputs must share the active Runtime Context.");
  const identities = new Map(input.identityReports.map((report) => [report.identityState.personReference, report]));
  const roles = new Map(input.roleReports.flatMap((report) => report.roleRecords.map((role) => [role.roleId, role] as const)));
  const relationships = new Map(input.ecosystemReports.flatMap((report) => report.relationships.map((relationship) => [relationship.relationshipId, relationship] as const)));
  const evidence = new Set([...input.identityReports.flatMap((report) => report.provenanceEvidence), ...input.roleReports.flatMap((report) => report.evidenceBundle), ...input.ecosystemReports.flatMap((report) => report.evidenceBundle)]);
  const participants = new Map<string, CommunicationParticipant>();
  for (const participant of input.participants) {
    const identity = identities.get(participant.personIdentity); const role = roles.get(participant.roleId);
    if (!identity?.verificationStatus.some(({ status }) => status === "VERIFIED") || !role) fail("UNAUTHORIZED_COMMUNICATION", "Participants require verified identity and an active identity-bound role.");
    if (role.personIdentity !== participant.personIdentity || role.roleType !== participant.roleType || role.state !== "ACTIVE") fail("UNAUTHORIZED_COMMUNICATION", "The active role must be bound to the participant identity.");
    if (!participant.permissions.includes("CONNECT") || !role.permissions.includes("CONNECT")) fail("UNAUTHORIZED_COMMUNICATION", "Communication requires explicit CONNECT permission.");
    if (!participant.preference.consent || participant.preference.participantIdentity !== participant.personIdentity || !participant.preference.channels.length || !participant.preference.categories.length) fail("INVALID_PREFERENCE", "Communication preferences must be explicit and consented.");
    if (participants.has(participant.personIdentity)) fail("UNAUTHORIZED_COMMUNICATION", "Each participant must have one unambiguous communication identity.");
    participants.set(participant.personIdentity, participant);
  }
  const consentFor = (message: MessageDraft) => input.consents.find((consent) => consent.consentId === message.consentId && consent.personIdentity === message.recipientIdentity && consent.recipientIdentity === message.senderIdentity && consent.purpose === message.purpose && consent.status === "GRANTED" && Date.parse(consent.expiresAt) > Date.parse(input.generatedAt));
  for (const message of input.messageDrafts) {
    const sender = participants.get(message.senderIdentity); const recipient = participants.get(message.recipientIdentity);
    if (!sender || !recipient) fail("UNAUTHORIZED_COMMUNICATION", "Sender and recipient must be authorized participants.");
    if (sender.personIdentity === recipient.personIdentity) fail("UNAUTHORIZED_COMMUNICATION", "Sender and recipient must be distinct participants.");
    if (!sender.preference.channels.includes(message.channel) || !sender.preference.categories.includes(message.category) || !recipient.preference.channels.includes(message.channel) || !recipient.preference.categories.includes(message.category)) fail("INVALID_PREFERENCE", "The message must satisfy both participants' preferences.");
    const relationship = relationships.get(message.relationshipId);
    if (!relationship || relationship.consentStatus !== "CONSENTED" || relationship.status !== "ACTIVE" || ![relationship.sourceEntityId, relationship.targetEntityId].includes(message.senderIdentity) || ![relationship.sourceEntityId, relationship.targetEntityId].includes(message.recipientIdentity)) fail("INVALID_RELATIONSHIP", "Communication requires an active, consented relationship between the participants.");
    const consent = consentFor(message);
    if (!consent || !consent.dataScope.includes(message.category) || !message.evidenceReferences.every((reference) => consent.evidenceReferences.includes(reference))) fail("MISSING_CONSENT", "Communication requires active purpose- and scope-specific consent evidence.");
    if (!message.purpose || !message.contentReference || Number.isNaN(Date.parse(message.timestamp)) || !message.evidenceReferences.length || message.evidenceReferences.some((reference) => !evidence.has(reference))) fail("MISSING_EVIDENCE", "Messages require purpose, content, timestamp, and traceable evidence.");
    const scopes = [message.external && "EXTERNAL_COMMUNICATION", sender.organizationIdentity && "ORGANIZATIONAL_MESSAGING", message.sensitive && "SENSITIVE_COMMUNICATION"].filter(Boolean);
    if (scopes.some((scope) => !input.humanApprovals.some((approval) => approval.scope === scope && approval.messageContentReference === message.contentReference && approval.evidenceReferences.length))) fail("GOVERNANCE_BYPASS", "External, organizational, and sensitive messages require scoped human approval.");
  }
  for (const notification of input.notificationDrafts) if (!participants.has(notification.recipientIdentity) || !notification.sourceReference || !notification.reason || !notification.evidenceReferences.length || notification.evidenceReferences.some((reference) => !evidence.has(reference))) fail("MISSING_EVIDENCE", "Notifications require an authorized recipient and traceable provenance.");
  for (const reminder of input.reminderDrafts) if (!participants.has(reminder.recipientIdentity) || !reminder.supportive || reminder.coercive || !reminder.evidenceReferences.length || Number.isNaN(Date.parse(reminder.dueAt))) fail("MANIPULATION_PROHIBITED", "Reminders must be evidenced, supportive, and non-coercive.");
  for (const workflow of input.workflowDrafts) if (!participants.has(workflow.senderIdentity) || !participants.has(workflow.recipientIdentity) || !relationships.has(workflow.relationshipId) || !input.consents.some(({ consentId, status }) => consentId === workflow.consentId && status === "GRANTED") || !workflow.evidenceReferences.length) fail("UNAUTHORIZED_COMMUNICATION", "Workflows require authorized participants, relationship, consent, purpose, and evidence.");
  return context;
}

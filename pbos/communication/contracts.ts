import type { PBOSRuntimeContext } from "../context";
import type { EcosystemReport } from "../ecosystem";
import type { IdentityReport } from "../identity";
import type { RoleReport, RoleType } from "../role";

export type CommunicationCategory = "MENTORSHIP" | "ACADEMIC_SUPPORT" | "ATHLETIC_SUPPORT" | "OPPORTUNITY" | "REMINDER" | "MILESTONE" | "COMMUNITY" | "ADMINISTRATIVE";
export type CommunicationChannel = "EMAIL" | "IN_APP" | "SMS" | "PUSH";
export type CommunicationConsentStatus = "GRANTED" | "PENDING" | "EXPIRED" | "REVOKED" | "DENIED";
export type NotificationKind = "INFORMATION" | "ACTION_REQUEST" | "DECISION";
export type CommunicationState = "CREATED" | "AUTHORIZED" | "SENT" | "DELIVERED" | "ACKNOWLEDGED" | "ARCHIVED";

export interface CommunicationPreference { participantIdentity: string; channels: CommunicationChannel[]; frequency: "IMMEDIATE" | "DAILY" | "WEEKLY"; categories: CommunicationCategory[]; consent: true; }
export interface CommunicationConsent { consentId: string; personIdentity: string; recipientIdentity: string; purpose: string; dataScope: string[]; expiresAt: string; status: CommunicationConsentStatus; evidenceReferences: string[]; visibility: "PRIVATE"; }
export interface CommunicationParticipant { personIdentity: string; roleId: string; roleType: RoleType; organizationIdentity: string | null; permissions: Array<"VIEW" | "CONNECT" | "SHARE">; consentId: string; preference: CommunicationPreference; identityReportId: string; provenance: string[]; }
export interface MessageDraft { senderIdentity: string; recipientIdentity: string; purpose: string; category: CommunicationCategory; contentReference: string; relationshipId: string; consentId: string; channel: CommunicationChannel; timestamp: string; evidenceReferences: string[]; external: boolean; sensitive: boolean; }
export interface MessageRecord extends MessageDraft { messageId: string; permissions: Array<"CONNECT" | "SHARE">; state: "AUTHORIZED"; provenance: { runtimeContextDigest: string; senderRoleId: string; recipientRoleId: string; consentId: string; relationshipId: string; evidenceReferences: string[] }; }
export interface NotificationDraft { recipientIdentity: string; sourceReference: string; reason: string; kind: NotificationKind; category: CommunicationCategory; permission: "VIEW"; timestamp: string; messageContentReference: string | null; evidenceReferences: string[]; }
export interface NotificationRecord extends NotificationDraft { notificationId: string; provenance: string[]; }
export interface ReminderDraft { recipientIdentity: string; category: "ACADEMIC" | "ATHLETIC" | "CAREER" | "PERSONAL"; subjectReference: string; dueAt: string; reason: string; evidenceReferences: string[]; supportive: true; coercive: false; }
export interface ReminderRecord extends ReminderDraft { reminderId: string; }
export type WorkflowType = "MENTOR_CHECK_IN" | "OPPORTUNITY_ALERT" | "APPLICATION_REMINDER" | "ATHLETE_RECRUITING_UPDATE" | "ACADEMIC_MILESTONE" | "COMMUNITY_ANNOUNCEMENT";
export interface CommunicationWorkflowDraft { workflowType: WorkflowType; triggerReference: string; recipientIdentity: string; senderIdentity: string; purpose: string; consentId: string; relationshipId: string; evidenceReferences: string[]; }
export interface CommunicationWorkflow extends CommunicationWorkflowDraft { workflowId: string; authorized: true; }

export interface CommunicationInput {
  runtimeContext: PBOSRuntimeContext | null;
  identityReports: IdentityReport[];
  roleReports: RoleReport[];
  ecosystemReports: EcosystemReport[];
  participants: CommunicationParticipant[];
  consents: CommunicationConsent[];
  messageDrafts: MessageDraft[];
  notificationDrafts: NotificationDraft[];
  reminderDrafts: ReminderDraft[];
  workflowDrafts: CommunicationWorkflowDraft[];
  generatedAt: string;
  humanApprovals: Array<{ approvalId: string; scope: "EXTERNAL_COMMUNICATION" | "ORGANIZATIONAL_MESSAGING" | "SENSITIVE_COMMUNICATION"; messageContentReference: string; approvedBy: string; evidenceReferences: string[] }>;
  inferredRelationshipRequested: boolean;
  impersonationRequested: boolean;
  privacyBypassRequested: boolean;
  spamRequested: boolean;
  manipulationRequested: boolean;
}
export interface CommunicationReport { reportId: string; generatedAt: string; runtimeContextDigest: string; participants: CommunicationParticipant[]; messages: MessageRecord[]; consentRecords: CommunicationConsent[]; relationshipIds: string[]; notifications: NotificationRecord[]; reminders: ReminderRecord[]; workflows: CommunicationWorkflow[]; evidenceBundle: string[]; limitations: string[]; }
export interface CommunicationLifecycle { currentState: CommunicationState; transitions: Array<{ from: CommunicationState; to: CommunicationState; timestamp: string; actorIdentity: string; evidenceReferences: string[] }>; }
export type CommunicationFailureCode = "INVALID_CONTEXT" | "UNAUTHORIZED_COMMUNICATION" | "MISSING_CONSENT" | "IMPERSONATION" | "PRIVACY_VIOLATION" | "INVALID_RELATIONSHIP" | "INVALID_PREFERENCE" | "MISSING_EVIDENCE" | "SPAM_PROHIBITED" | "MANIPULATION_PROHIBITED" | "GOVERNANCE_BYPASS" | "INVALID_TRANSITION";
export interface CommunicationFailure { code: CommunicationFailureCode; message: string; }

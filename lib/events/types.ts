export type PlaybookEventType =
  | "AchievementCreated"
  | "EvidenceAdded"
  | "ReflectionWritten"
  | "VerificationApproved"
  | "CertificateEarned"
  | "TranscriptImported"
  | "CourseCompleted"
  | "VolunteerHoursUpdated"
  | "OpportunityUnlocked"
  | "TrustScoreChanged"
  | "PortfolioUpdated"
  | "TimelineUpdated";

export interface PlaybookEvent<TPayload = any> {
  id: string;
  type: PlaybookEventType;
  payload: TPayload;
  createdAt: string;
  source?: string;
}

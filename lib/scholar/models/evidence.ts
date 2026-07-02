export type EvidenceType =
  | "document"
  | "photo"
  | "video"
  | "link"
  | "certificate"
  | "transcript"
  | "recommendation"
  | "media"
  | "other";

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  description?: string;
  url?: string;
  filePath?: string;
  source?: string;
  uploadedAt?: string;
  verified?: boolean;
}

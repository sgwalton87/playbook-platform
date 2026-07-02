export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface Verification {
  id: string;
  status: VerificationStatus;
  verifiedBy?: string;
  verifierRole?: string;
  verifiedAt?: string;
  notes?: string;
}

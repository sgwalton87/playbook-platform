export type StartingFiveRole =
  | "ParentGuardian"
  | "Counselor"
  | "Teacher"
  | "Mentor"
  | "Coach"
  | "TrustedAdult";

export type SupportMemberStatus =
  | "pending"
  | "invited"
  | "accepted";

export interface SupportNetworkMember {
  id: string;
  scholarId: string;

  role: StartingFiveRole;

  fullName: string;

  email?: string | null;

  phone?: string | null;

  relationship?: string | null;

  status: SupportMemberStatus;

  isStartingFive: boolean;

  invitedAt?: string | null;

  acceptedAt?: string | null;

  createdAt?: string;

  updatedAt?: string;
}

export interface StartingFiveSlot {
  role: StartingFiveRole;

  label: string;

  required: boolean;

  filled: boolean;

  member?: SupportNetworkMember;
}

export interface StartingFiveSummary {
  completed: number;

  total: number;

  percentage: number;

  slots: StartingFiveSlot[];
}
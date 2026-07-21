export interface SupportMember {
  id: string;

  name: string;

  relationship:
    | "Parent"
    | "Guardian"
    | "Coach"
    | "Teacher"
    | "Counselor"
    | "Mentor"
    | "Advisor"
    | "Other";

  email?: string;
  phone?: string;

  invited: boolean;
  verified: boolean;
}

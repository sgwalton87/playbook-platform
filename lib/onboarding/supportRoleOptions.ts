import type { RelationshipKind } from "@/lib/permissions";
import type { PlaybookRole } from "@/lib/roles/registry";

export type SupportRoleOption = {
  role: PlaybookRole;
  label: string;
  relationship: RelationshipKind;
};

export const SUPPORT_ROLE_OPTIONS: readonly SupportRoleOption[] = [
  { role: "family", label: "Parent / Guardian", relationship: "parent_guardian" },
  { role: "coach", label: "High School Coach", relationship: "educator" },
  { role: "counselor", label: "School Counselor", relationship: "educator" },
  { role: "educator", label: "Teacher / Educator", relationship: "educator" },
  { role: "mentor", label: "Mentor / Trusted Adult", relationship: "mentor" },
  { role: "college-coach", label: "College Coach / Recruiter", relationship: "university_partner" },
  { role: "college-admissions", label: "College Admissions", relationship: "university_partner" },
  { role: "employer", label: "Employer / Workforce Partner", relationship: "employer_partner" },
  { role: "brand-partner", label: "Brand Partner", relationship: "employer_partner" },
  { role: "district", label: "District / School Administrator", relationship: "district_admin" },
  { role: "scholar-athlete", label: "Scholar-Athlete Peer", relationship: "scholar" },
  { role: "athlete-abroad", label: "Athlete Abroad Peer", relationship: "scholar" },
  { role: "transition-youth", label: "Transition-Aged Youth Peer", relationship: "scholar" },
  { role: "scholar", label: "Scholar Peer", relationship: "scholar" },
  { role: "other", label: "Other", relationship: "mentor" },
];

export function getSupportRoleOptions(ownerRole?: string | null) {
  return SUPPORT_ROLE_OPTIONS.filter((option) => option.role !== ownerRole);
}

export function getSupportRoleOption(role?: string | null) {
  return SUPPORT_ROLE_OPTIONS.find((option) => option.role === role);
}

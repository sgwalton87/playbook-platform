import type { PlaybookRole } from "@/lib/roles/registry";

export type InstitutionalVerificationRole = Extract<
  PlaybookRole,
  "educator" | "high-school-counselor" | "coach"
>;

export interface InstitutionalVerificationEvidence {
  role: InstitutionalVerificationRole;
  officialEmail: string;
  organizationName: string;
  evidence: Record<string, unknown>;
}

const clean = (value: unknown) => String(value ?? "").trim();
const compact = (values: unknown) =>
  Array.isArray(values) ? values.map((value) => clean(value)).filter(Boolean) : [];

export function isInstitutionalVerificationRole(role: PlaybookRole): role is InstitutionalVerificationRole {
  return role === "educator" || role === "high-school-counselor" || role === "coach";
}

export function buildInstitutionalVerificationEvidence(
  role: InstitutionalVerificationRole,
  onboarding: Record<string, unknown>
): InstitutionalVerificationEvidence {
  if (role === "educator") {
    const organizationName = clean(onboarding.school || onboarding.organization_name);
    const officialEmail = clean(onboarding.official_edu_email).toLowerCase();
    if (!organizationName || !officialEmail) {
      throw new Error("Educator verification requires a school/organization and official school email.");
    }
    return {
      role,
      officialEmail,
      organizationName,
      evidence: {
        school: organizationName,
        schoolDistrict: clean(onboarding.school_district),
        subjectsTaught: compact(onboarding.subjects_taught),
        supportFocus: compact(onboarding.educator_support_focus),
        openToLetters: clean(onboarding.open_to_letters),
      },
    };
  }

  if (role === "high-school-counselor") {
    const organizationName = clean(onboarding.school);
    const officialEmail = clean(onboarding.official_email).toLowerCase();
    if (!organizationName || !officialEmail) {
      throw new Error("Counselor verification requires a school and official institutional email.");
    }
    return {
      role,
      officialEmail,
      organizationName,
      evidence: {
        school: organizationName,
        schoolDistrict: clean(onboarding.school_district),
        counselorScope: compact(onboarding.counselor_scope),
      },
    };
  }

  const organizationName = clean(onboarding.school);
  const officialEmail = clean(onboarding.official_school_email).toLowerCase();
  if (!organizationName || !officialEmail) {
    throw new Error("Coach verification requires a high school and official school email.");
  }
  return {
    role,
    officialEmail,
    organizationName,
    evidence: {
      school: organizationName,
      schoolCity: clean(onboarding.school_city),
      schoolState: clean(onboarding.school_state),
      primarySport: clean(onboarding.primary_sport),
      coachRole: clean(onboarding.coach_role),
      yearsCoaching: clean(onboarding.years_coaching),
      rosterSize: clean(onboarding.roster_size),
      supportFocus: compact(onboarding.coach_support_focus),
    },
  };
}

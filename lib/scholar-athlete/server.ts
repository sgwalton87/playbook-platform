import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AthleteProfileProjection,
  NILDealProjection,
  NILProfileProjection,
  RecruitingTargetProjection,
  ScholarAthleteDashboardData,
} from "./dashboard";

type Row = Record<string, unknown>;

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function row(value: unknown): Row | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Row)
    : null;
}

function mapAthleteProfile(value: unknown): AthleteProfileProjection | null {
  const item = row(value);
  const id = stringValue(item?.id);
  const scholarId = stringValue(item?.scholar_id);
  const sport = stringValue(item?.sport);
  const graduationYear = numberValue(item?.graduation_year);
  if (!item || !id || !scholarId || !sport || graduationYear === null) return null;
  return {
    id,
    scholarId,
    sport,
    secondarySport: stringValue(item.secondary_sport),
    position: stringValue(item.position),
    secondaryPosition: stringValue(item.secondary_position),
    graduationYear,
    athleteLevel: (stringValue(item.athlete_level) ?? "high_school") as AthleteProfileProjection["athleteLevel"],
    governingPath: (stringValue(item.governing_path) ?? "undecided") as AthleteProfileProjection["governingPath"],
    recruitingStatus: stringValue(item.recruiting_status) ?? "exploring",
    highlightUrl: stringValue(item.highlight_url),
    bio: stringValue(item.bio),
    location: stringValue(item.location),
    teams: stringArray(item.teams),
    leagues: stringArray(item.leagues),
    awards: stringArray(item.awards),
    leadershipExperience: stringArray(item.leadership_experience),
    visibility: (stringValue(item.visibility) ?? "private") as AthleteProfileProjection["visibility"],
    verificationState: stringValue(item.verification_state) ?? "unverified",
    updatedAt: stringValue(item.updated_at) ?? new Date(0).toISOString(),
  };
}

function mapRecruitingTarget(value: unknown): RecruitingTargetProjection | null {
  const item = row(value);
  const id = stringValue(item?.id);
  const schoolName = stringValue(item?.school_name);
  const stage = stringValue(item?.stage);
  if (!item || !id || !schoolName || !stage) return null;
  return {
    id, schoolName, stage: stage as RecruitingTargetProjection["stage"],
    athleticProgram: stringValue(item.athletic_program), division: stringValue(item.division),
    coachName: stringValue(item.coach_name), coachEmail: stringValue(item.coach_email),
    nextAction: stringValue(item.next_action), nextActionDueAt: stringValue(item.next_action_due_at),
    notes: stringValue(item.notes), createdAt: stringValue(item.created_at) ?? new Date(0).toISOString(),
  };
}

function mapNILDeal(value: unknown): NILDealProjection | null {
  const item = row(value);
  const id = stringValue(item?.id);
  const brandName = stringValue(item?.brand_name);
  const title = stringValue(item?.opportunity_title);
  const stage = stringValue(item?.stage);
  if (!item || !id || !brandName || !title || !stage) return null;
  return {
    id, brandName, opportunityTitle: title,
    opportunityType: (stringValue(item.opportunity_type) ?? "sponsorship") as NILDealProjection["opportunityType"],
    stage: stage as NILDealProjection["stage"], compensationType: stringValue(item.compensation_type),
    compensationAmount: numberValue(item.compensation_amount), contractStatus: stringValue(item.contract_status) ?? "not_received",
    disclosureStatus: stringValue(item.disclosure_status) ?? "not_started", complianceStatus: stringValue(item.compliance_status) ?? "not_submitted",
    paymentStatus: stringValue(item.payment_status) ?? "not_due", jurisdiction: stringValue(item.jurisdiction),
    institutionName: stringValue(item.institution_name), sourceName: stringValue(item.source_name),
    createdAt: stringValue(item.created_at) ?? new Date(0).toISOString(),
  };
}

function mapSocialPresence(value: unknown): NILProfileProjection["socialPresence"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    const item = row(candidate);
    const platform = stringValue(item?.platform);
    const handle = stringValue(item?.handle);
    const url = stringValue(item?.url);
    return platform && handle ? [{ platform, handle, ...(url ? { url } : {}) }] : [];
  });
}

function mapNILProfile(value: unknown): NILProfileProjection | null {
  const item = row(value);
  const id = stringValue(item?.id);
  const athleteProfileId = stringValue(item?.athlete_profile_id);
  if (!item || !id || !athleteProfileId) return null;
  return {
    id, athleteProfileId, brandStatement: stringValue(item.brand_statement),
    brandValues: stringArray(item.brand_values), brandCategories: stringArray(item.brand_categories),
    partnershipInterests: stringArray(item.partnership_interests), socialPresence: mapSocialPresence(item.social_presence),
    visibility: (stringValue(item.visibility) ?? "private") as NILProfileProjection["visibility"],
    discoverable: item.discoverable === true, marketplaceConsentAt: stringValue(item.marketplace_consent_at),
    verificationState: stringValue(item.verification_state) ?? "unverified",
  };
}

export async function loadScholarAthleteDashboard(
  supabase: SupabaseClient,
  scholarId: string,
): Promise<{ ok: true; data: ScholarAthleteDashboardData } | { ok: false; error: string }> {
  const [scholar, profile, recruiting, deals, nilProfile, activity] = await Promise.all([
    supabase.from("profiles").select("id,full_name,username,school,gpa").eq("id", scholarId).maybeSingle(),
    supabase.from("athlete_profiles").select("id,scholar_id,sport,secondary_sport,position,secondary_position,graduation_year,athlete_level,governing_path,recruiting_status,highlight_url,bio,location,teams,leagues,awards,leadership_experience,visibility,verification_state,updated_at").eq("scholar_id", scholarId).maybeSingle(),
    supabase.from("recruiting_targets").select("id,school_name,athletic_program,division,coach_name,coach_email,stage,next_action,next_action_due_at,notes,created_at").eq("scholar_id", scholarId).order("created_at", { ascending: false }).limit(50),
    supabase.from("nil_deals").select("id,brand_name,opportunity_title,opportunity_type,stage,compensation_type,compensation_amount,contract_status,disclosure_status,compliance_status,payment_status,jurisdiction,institution_name,source_name,created_at").eq("scholar_id", scholarId).order("created_at", { ascending: false }).limit(50),
    supabase.from("athlete_nil_profiles").select("id,athlete_profile_id,brand_statement,brand_values,brand_categories,partnership_interests,social_presence,visibility,discoverable,marketplace_consent_at,verification_state").eq("scholar_id", scholarId).maybeSingle(),
    supabase.from("athlete_recruiting_activities").select("id", { count: "exact", head: true }).eq("scholar_id", scholarId),
  ]);
  const failed = [scholar, profile, recruiting, deals, nilProfile, activity].find((result) => result.error);
  if (failed?.error) return { ok: false, error: "Athlete workspace data is unavailable." };
  const scholarRow = row(scholar.data);
  if (!scholarRow) return { ok: false, error: "Scholar identity is unavailable." };
  return {
    ok: true,
    data: {
      scholar: {
        id: scholarId,
        name: stringValue(scholarRow.full_name) ?? stringValue(scholarRow.username) ?? "Scholar-Athlete",
        school: stringValue(scholarRow.school),
        gpa: numberValue(scholarRow.gpa),
      },
      athleteProfile: mapAthleteProfile(profile.data),
      nilProfile: mapNILProfile(nilProfile.data),
      recruitingTargets: Array.isArray(recruiting.data) ? recruiting.data.flatMap((item) => mapRecruitingTarget(item) ?? []) : [],
      nilDeals: Array.isArray(deals.data) ? deals.data.flatMap((item) => mapNILDeal(item) ?? []) : [],
      recentRecruitingActivityCount: activity.count ?? 0,
    },
  };
}

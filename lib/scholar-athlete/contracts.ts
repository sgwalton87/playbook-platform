import type { GoverningPath } from "./types";
import type { NILDealStage } from "./nilEngine";
import type { RecruitingStage } from "./recruitingEngine";

export const ATHLETE_LEVELS = [
  "youth",
  "middle_school",
  "high_school",
  "college",
  "professional",
  "retired",
  "international",
] as const;
export type AthleteLevel = (typeof ATHLETE_LEVELS)[number];

export const ATHLETE_VISIBILITY = [
  "private",
  "network",
  "recruiting",
  "public",
] as const;
export type AthleteVisibility = (typeof ATHLETE_VISIBILITY)[number];

export const NIL_OPPORTUNITY_TYPES = [
  "sponsorship",
  "ambassador",
  "appearance",
  "camp",
  "clinic",
  "social_campaign",
  "content",
  "merchandise",
  "affiliate",
  "entrepreneurship",
] as const;
export type NILOpportunityType = (typeof NIL_OPPORTUNITY_TYPES)[number];

export type ContractResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type AthleteProfileCommand = {
  sport: string;
  secondarySport: string | null;
  position: string | null;
  secondaryPosition: string | null;
  graduationYear: number;
  athleteLevel: AthleteLevel;
  governingPath: GoverningPath;
  bio: string | null;
  location: string | null;
  highlightUrl: string | null;
  teams: string[];
  leagues: string[];
  awards: string[];
  leadershipExperience: string[];
  visibility: AthleteVisibility;
};

export type RecruitingTargetCommand = {
  schoolName: string;
  athleticProgram: string | null;
  division: string | null;
  coachName: string | null;
  coachEmail: string | null;
  stage: RecruitingStage;
  nextAction: string | null;
  nextActionDueAt: string | null;
  notes: string | null;
};

export type NILDealCommand = {
  brandName: string;
  opportunityTitle: string;
  opportunityType: NILOpportunityType;
  compensationType: "cash" | "product" | "equity" | "mixed" | null;
  compensationAmount: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  jurisdiction: string | null;
  institutionName: string | null;
};

export type NILProfileCommand = {
  athleteProfileId: string;
  brandStatement: string | null;
  brandValues: string[];
  brandCategories: string[];
  partnershipInterests: string[];
  socialPresence: Array<{ platform: string; handle: string; url?: string }>;
  visibility: "private" | "network" | "marketplace";
  discoverable: boolean;
  marketplaceConsent: boolean;
};

type InputRecord = Record<string, unknown>;

function inputRecord(value: unknown): InputRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as InputRecord)
    : null;
}

function text(
  value: unknown,
  label: string,
  maximum: number,
  required = false,
): ContractResult<string | null> {
  if (value === undefined || value === null || value === "") {
    return required
      ? { ok: false, error: `${label} is required.` }
      : { ok: true, value: null };
  }
  if (typeof value !== "string") return { ok: false, error: `${label} must be text.` };
  const normalized = value.trim();
  if (!normalized && required) return { ok: false, error: `${label} is required.` };
  if (normalized.length > maximum) {
    return { ok: false, error: `${label} must be ${maximum} characters or fewer.` };
  }
  return { ok: true, value: normalized || null };
}

function stringList(
  value: unknown,
  label: string,
  maximumItems = 20,
): ContractResult<string[]> {
  if (value === undefined || value === null) return { ok: true, value: [] };
  if (!Array.isArray(value) || value.length > maximumItems) {
    return { ok: false, error: `${label} must contain at most ${maximumItems} items.` };
  }
  const normalized: string[] = [];
  for (const item of value) {
    const result = text(item, label, 120, true);
    if (!result.ok) return result;
    if (result.value && !normalized.includes(result.value)) normalized.push(result.value);
  }
  return { ok: true, value: normalized };
}

function oneOf<T extends string>(
  value: unknown,
  values: readonly T[],
  label: string,
  fallback?: T,
): ContractResult<T> {
  const candidate = typeof value === "string" ? value : fallback;
  return candidate && values.includes(candidate as T)
    ? { ok: true, value: candidate as T }
    : { ok: false, error: `${label} is invalid.` };
}

function firstError(results: Array<ContractResult<unknown>>): string | null {
  const failure = results.find((result) => !result.ok);
  return failure && !failure.ok ? failure.error : null;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const GOVERNING_PATHS = [
  "ncaa_d1",
  "ncaa_d2",
  "ncaa_d3",
  "naia",
  "juco",
  "undecided",
] as const satisfies readonly GoverningPath[];
const RECRUITING_STAGES = [
  "researching",
  "watchlist",
  "contacted",
  "conversation",
  "visit",
  "offer",
  "committed",
  "closed",
] as const satisfies readonly RecruitingStage[];

export function parseAthleteProfileCommand(
  input: unknown,
): ContractResult<AthleteProfileCommand> {
  const body = inputRecord(input);
  if (!body) return { ok: false, error: "A profile payload is required." };
  const sport = text(body.sport, "Primary sport", 80, true);
  const secondarySport = text(body.secondarySport, "Secondary sport", 80);
  const position = text(body.position, "Position", 80);
  const secondaryPosition = text(body.secondaryPosition, "Secondary position", 80);
  const level = oneOf(body.athleteLevel, ATHLETE_LEVELS, "Athlete level", "high_school");
  const path = oneOf(body.governingPath, GOVERNING_PATHS, "Governing path", "undecided");
  const bio = text(body.bio, "Athlete biography", 1000);
  const location = text(body.location, "Location", 160);
  const highlightUrl = text(body.highlightUrl, "Highlight URL", 500);
  const teams = stringList(body.teams, "Teams");
  const leagues = stringList(body.leagues, "Leagues");
  const awards = stringList(body.awards, "Awards");
  const leadership = stringList(body.leadershipExperience, "Leadership experience");
  const visibility = oneOf(body.visibility, ATHLETE_VISIBILITY, "Visibility", "private");
  const error = firstError([
    sport, secondarySport, position, secondaryPosition, level, path, bio, location,
    highlightUrl, teams, leagues, awards, leadership, visibility,
  ]);
  if (error) return { ok: false, error };
  const graduationYear = Number(body.graduationYear);
  if (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2100) {
    return { ok: false, error: "Graduation year must be between 2000 and 2100." };
  }
  const parsedUrl = highlightUrl.ok ? highlightUrl.value : null;
  if (parsedUrl) {
    if (!isHttpsUrl(parsedUrl)) {
      return { ok: false, error: "Highlight URL must be a valid HTTPS URL." };
    }
  }
  if (!sport.ok || !level.ok || !path.ok || !visibility.ok || !teams.ok || !leagues.ok || !awards.ok || !leadership.ok) {
    return { ok: false, error: "Profile validation failed." };
  }
  return {
    ok: true,
    value: {
      sport: sport.value ?? "",
      secondarySport: secondarySport.ok ? secondarySport.value : null,
      position: position.ok ? position.value : null,
      secondaryPosition: secondaryPosition.ok ? secondaryPosition.value : null,
      graduationYear,
      athleteLevel: level.value,
      governingPath: path.value,
      bio: bio.ok ? bio.value : null,
      location: location.ok ? location.value : null,
      highlightUrl: parsedUrl,
      teams: teams.value,
      leagues: leagues.value,
      awards: awards.value,
      leadershipExperience: leadership.value,
      visibility: visibility.value,
    },
  };
}

export function parseRecruitingTargetCommand(
  input: unknown,
): ContractResult<RecruitingTargetCommand> {
  const body = inputRecord(input);
  if (!body) return { ok: false, error: "A recruiting target payload is required." };
  const school = text(body.schoolName, "School", 160, true);
  const program = text(body.athleticProgram, "Athletic program", 160);
  const division = text(body.division, "Division", 80);
  const coach = text(body.coachName, "Coach name", 160);
  const coachEmail = text(body.coachEmail, "Coach email", 254);
  const stage = oneOf(body.stage, RECRUITING_STAGES, "Recruiting stage", "researching");
  const nextAction = text(body.nextAction, "Next action", 500);
  const notes = text(body.notes, "Notes", 2000);
  const error = firstError([school, program, division, coach, coachEmail, stage, nextAction, notes]);
  if (error) return { ok: false, error };
  const email = coachEmail.ok ? coachEmail.value : null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Coach email is invalid." };
  }
  const due = text(body.nextActionDueAt, "Next-action due date", 40);
  if (!due.ok) return due;
  if (due.value && Number.isNaN(Date.parse(due.value))) {
    return { ok: false, error: "Next-action due date is invalid." };
  }
  if (!school.ok || !stage.ok) return { ok: false, error: "Recruiting validation failed." };
  return { ok: true, value: {
    schoolName: school.value ?? "", athleticProgram: program.ok ? program.value : null,
    division: division.ok ? division.value : null, coachName: coach.ok ? coach.value : null,
    coachEmail: email, stage: stage.value, nextAction: nextAction.ok ? nextAction.value : null,
    nextActionDueAt: due.value ? new Date(due.value).toISOString() : null,
    notes: notes.ok ? notes.value : null,
  } };
}

export function parseNILDealCommand(input: unknown): ContractResult<NILDealCommand> {
  const body = inputRecord(input);
  if (!body) return { ok: false, error: "An NIL opportunity payload is required." };
  const brand = text(body.brandName, "Brand", 160, true);
  const title = text(body.opportunityTitle, "Opportunity title", 200, true);
  const opportunityType = oneOf(body.opportunityType, NIL_OPPORTUNITY_TYPES, "Opportunity type", "sponsorship");
  const compensationType = body.compensationType === null || body.compensationType === ""
    ? { ok: true, value: null } as const
    : oneOf(body.compensationType, ["cash","product","equity","mixed"] as const, "Compensation type");
  const sourceName = text(body.sourceName, "Opportunity source", 160);
  const sourceUrl = text(body.sourceUrl, "Source URL", 500);
  const jurisdiction = text(body.jurisdiction, "Jurisdiction", 160);
  const institution = text(body.institutionName, "Institution", 200);
  const error = firstError([brand,title,opportunityType,compensationType,sourceName,sourceUrl,jurisdiction,institution]);
  if (error) return { ok: false, error };
  const amount = body.compensationAmount === null || body.compensationAmount === "" || body.compensationAmount === undefined
    ? null : Number(body.compensationAmount);
  if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 100000000)) {
    return { ok: false, error: "Compensation amount is invalid." };
  }
  if (sourceUrl.ok && sourceUrl.value && !isHttpsUrl(sourceUrl.value)) {
    return { ok: false, error: "Source URL must be a valid HTTPS URL." };
  }
  if (!brand.ok || !title.ok || !opportunityType.ok || !compensationType.ok) return { ok: false, error: "NIL validation failed." };
  return { ok: true, value: {
    brandName: brand.value ?? "", opportunityTitle: title.value ?? "",
    opportunityType: opportunityType.value, compensationType: compensationType.value,
    compensationAmount: amount, sourceName: sourceName.ok ? sourceName.value : null,
    sourceUrl: sourceUrl.ok ? sourceUrl.value : null,
    jurisdiction: jurisdiction.ok ? jurisdiction.value : null,
    institutionName: institution.ok ? institution.value : null,
  } };
}

export function parseNILProfileCommand(input: unknown): ContractResult<NILProfileCommand> {
  const body = inputRecord(input);
  if (!body) return { ok: false, error: "An NIL profile payload is required." };
  const athleteProfileId = text(body.athleteProfileId, "Athlete profile", 80, true);
  const statement = text(body.brandStatement, "Brand statement", 1000);
  const values = stringList(body.brandValues, "Brand values", 12);
  const categories = stringList(body.brandCategories, "Brand categories", 20);
  const interests = stringList(body.partnershipInterests, "Partnership interests", 20);
  const visibility = oneOf(body.visibility, ["private","network","marketplace"] as const, "NIL visibility", "private");
  const error = firstError([athleteProfileId,statement,values,categories,interests,visibility]);
  if (error) return { ok: false, error };
  const social: NILProfileCommand["socialPresence"] = [];
  if (body.socialPresence !== undefined) {
    if (!Array.isArray(body.socialPresence) || body.socialPresence.length > 12) {
      return { ok: false, error: "Social presence must contain at most 12 profiles." };
    }
    for (const item of body.socialPresence) {
      const entry = inputRecord(item);
      const platform = text(entry?.platform, "Social platform", 80, true);
      const handle = text(entry?.handle, "Social handle", 120, true);
      const url = text(entry?.url, "Social URL", 500);
      if (!platform.ok || !handle.ok || !url.ok) return { ok: false, error: "A social profile is invalid." };
      if (url.value && !isHttpsUrl(url.value)) return { ok: false, error: "Social URL must be a valid HTTPS URL." };
      social.push({ platform: platform.value ?? "", handle: handle.value ?? "", ...(url.value ? { url: url.value } : {}) });
    }
  }
  const discoverable = body.discoverable === true;
  const marketplaceConsent = body.marketplaceConsent === true;
  if (discoverable && (!marketplaceConsent || !visibility.ok || visibility.value !== "marketplace")) {
    return { ok: false, error: "Marketplace discovery requires explicit consent and marketplace visibility." };
  }
  if (!athleteProfileId.ok || !values.ok || !categories.ok || !interests.ok || !visibility.ok) return { ok: false, error: "NIL profile validation failed." };
  return { ok: true, value: {
    athleteProfileId: athleteProfileId.value ?? "", brandStatement: statement.ok ? statement.value : null,
    brandValues: values.value, brandCategories: categories.value, partnershipInterests: interests.value,
    socialPresence: social, visibility: visibility.value, discoverable, marketplaceConsent,
  } };
}

export function parseNILStage(value: unknown): ContractResult<NILDealStage> {
  return oneOf(value, ["lead","conversation","negotiation","review","signed","active","completed","declined"] as const, "NIL stage");
}

/**
 * ============================================================================
 * PLAYBOOK CANONICAL ATHLETICS DOMAIN
 * Version 1.0
 * ============================================================================
 *
 * This is the ONLY source of truth for athletics across Playbook.
 *
 * Consumed by:
 *
 * - Scholar Dashboard
 * - Scholar Athlete OS
 * - Coach OS
 * - Parent OS
 * - Recruiter OS
 * - Athlete Abroad OS
 * - University OS
 * - Public Profile
 * - Future AI Mentor
 *
 * Never duplicate athletic fields outside this domain.
 * ============================================================================
 */

export interface AthleticsProfile {
  status: AthleteStatus;

  goals: AthleteGoals;

  sports: AthleteSport[];

  affiliations: AthleteAffiliation[];

  measurements: AthleteMeasurement[];

  metrics: AthleteMetric[];

  rankings: AthleteRanking[];

  achievements: AthleteAchievement[];

  eligibility: AthleteEligibility;

  recruiting: AthleteRecruiting;

  media: AthleteMedia;

  contacts: AthleteContact[];

  nil: AthleteNIL;

  international: AthleteInternational;

  transition: AthleteTransition;

  timeline: AthleteTimelineEvent[];
}

/* ============================================================================
   STATUS
============================================================================ */

export interface AthleteStatus {
  isAthlete: boolean;

  careerStage:
    | "exploring"
    | "youth"
    | "middle-school"
    | "high-school"
    | "prep"
    | "juco"
    | "college"
    | "professional"
    | "olympic"
    | "paralympic"
    | "masters"
    | "retired"
    | "other";

  participationStatus:
    | "active"
    | "offseason"
    | "injured"
    | "rehabbing"
    | "redshirt"
    | "transfer"
    | "unsigned"
    | "retired";

  startedYear?: number;

  retiredYear?: number;

  biography?: string;
}

/* ============================================================================
   GOALS
============================================================================ */

export interface AthleteGoals {
  dream: string | null;

  shortTerm: AthleteGoal[];

  longTerm: AthleteGoal[];

  afterSports: AthleteGoal[];
}

export interface AthleteGoal {
  id: string;

  title: string;

  description?: string;

  category:
    | "development"
    | "academic"
    | "recruiting"
    | "professional"
    | "financial"
    | "leadership"
    | "community"
    | "wellness"
    | "other";

  status:
    | "dream"
    | "planned"
    | "active"
    | "completed";

  targetDate?: string;

  priority?: number;
}

/* ============================================================================
   SPORTS
============================================================================ */

export interface AthleteSport {
  id: string;

  sport: string;

  discipline?: string;

  primary: boolean;

  positions: string[];

  events: string[];

  classifications: string[];

  yearsPlayed?: number;

  dominantHand?: string;

  preferredFoot?: string;
}

/* ============================================================================
   TEAM HISTORY
============================================================================ */

export interface AthleteAffiliation {
  id: string;

  organization: string;

  team?: string;

  level?: string;

  league?: string;

  conference?: string;

  division?: string;

  startDate?: string;

  endDate?: string;

  current: boolean;

  jerseyNumber?: string;

  role?: string;
}

/* ============================================================================
   MEASUREMENTS
============================================================================ */

export interface AthleteMeasurement {
  id: string;

  type: string;

  value: number | string;

  unit?: string;

  measuredAt?: string;

  verified?: boolean;
}

/* ============================================================================
   PERFORMANCE
============================================================================ */

export interface AthleteMetric {
  id: string;

  season?: string;

  name: string;

  value: number | string;

  unit?: string;

  verified?: boolean;
}

export interface AthleteRanking {
  id: string;

  organization: string;

  ranking: number | string;

  category?: string;

  season?: string;
}

/* ============================================================================
   ACHIEVEMENTS
============================================================================ */

export interface AthleteAchievement {
  id: string;

  title: string;

  organization?: string;

  description?: string;

  achievedAt?: string;

  verified?: boolean;
}

/* ============================================================================
   ELIGIBILITY
============================================================================ */

export interface AthleteEligibility {
  ncaaStatus?: string;

  naiaStatus?: string;

  academicStanding?: string;

  amateurStatus?: string;
}

/* ============================================================================
   RECRUITING
============================================================================ */

export interface AthleteRecruiting {
  openToRecruiting: boolean;

  graduationClass?: string;

  desiredLevels: string[];

  desiredSchools: string[];

  recruitingEmail?: string;

  hudl?: string;

  recruitingNotes?: string;
}

/* ============================================================================
   MEDIA
============================================================================ */

export interface AthleteMedia {
  profilePhoto?: string;

  highlightVideo?: string;

  gameFilm: string[];

  interviews: string[];

  articles: string[];

  socialLinks: Record<string, string>;
}

/* ============================================================================
   CONTACTS
============================================================================ */

export interface AthleteContact {
  id: string;

  name: string;

  role: string;

  organization?: string;

  email?: string;

  phone?: string;
}

/* ============================================================================
   NIL
============================================================================ */

export interface AthleteNIL {
  interested: boolean;

  partnerships: string[];

  representation?: string;

  valuation?: number;
}

/* ============================================================================
   INTERNATIONAL
============================================================================ */

export interface AthleteInternational {
  passportCountry?: string;

  eligibleCountries: string[];

  visaStatus?: string;

  languages: string[];
}

/* ============================================================================
   RETIREMENT
============================================================================ */

export interface AthleteTransition {
  retired: boolean;

  retirementDate?: string;

  careerGoals: string[];

  educationGoals: string[];

  coachingGoals: string[];

  businessGoals: string[];
}

/* ============================================================================
   TIMELINE
============================================================================ */

export interface AthleteTimelineEvent {
  id: string;

  title: string;

  description?: string;

  category: string;

  occurredAt?: string;
}
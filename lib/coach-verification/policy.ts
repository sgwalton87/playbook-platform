export type CoachVerificationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface CoachVerificationEvidence {
  school: string;
  schoolCity: string | null;
  schoolState: string | null;
  officialSchoolEmail: string;
  primarySport: string;
  coachRole: string;
  yearsCoaching: string | null;
  rosterSize: string | null;
  uploadGameFilm: string | null;
  sendPlayerRecommendations: string | null;
  supportFocus: string[];
}

const text = (value: unknown) => String(value ?? "").trim();

export function buildCoachVerificationEvidence(data: Record<string, unknown>): CoachVerificationEvidence {
  const evidence: CoachVerificationEvidence = {
    school: text(data.school),
    schoolCity: text(data.school_city) || null,
    schoolState: text(data.school_state) || null,
    officialSchoolEmail: text(data.official_school_email),
    primarySport: text(data.primary_sport),
    coachRole: text(data.coach_role),
    yearsCoaching: text(data.years_coaching) || null,
    rosterSize: text(data.roster_size) || null,
    uploadGameFilm: text(data.upload_game_film) || null,
    sendPlayerRecommendations: text(data.send_player_recommendations) || null,
    supportFocus: Array.isArray(data.coach_support_focus)
      ? data.coach_support_focus.map(text).filter(Boolean)
      : [],
  };

  if (!evidence.school || !evidence.officialSchoolEmail || !evidence.primarySport || !evidence.coachRole) {
    throw new Error("Coach verification requires school, official school email, primary sport, and coaching role.");
  }

  return evidence;
}

export function coachAuthorityReady(input: {
  verificationStatus: CoachVerificationStatus;
  hasActiveCoachRelationship: boolean;
}) {
  return input.verificationStatus === "approved" && input.hasActiveCoachRelationship;
}

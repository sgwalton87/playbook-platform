/**
 * Read-only compatibility projection between the current onboarding draft
 * and the older profile editor's column names.
 *
 * This deliberately does not update the database: the editor can show recent
 * saved answers without rewriting legacy fields until the member saves.
 * The onboarding snapshot stays private and is never published by this helper.
 */
export function hydrateProfileFromOnboarding<T extends Record<string, unknown>>(profile: T): T {
  const draft = profile.onboarding_data;
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) return profile;
  const source = draft as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...profile };

  const mappings: Record<string, string> = {
    full_name: "full_name",
    bio: "bio",
    race: "race",
    school: "school",
    grade: "grade",
    dream_school: "dream_school",
    school_district: "school_district",
    graduation_year: "grad_year",
    intended_major: "intended_major",
    primary_sport: "sport",
    position: "position",
    current_team: "travel_team",
    highlight_link: "highlight_reel_url",
    city: "city",
    zip_code: "zip_code",
    weighted_gpa: "weighted_gpa",
    unweighted_gpa: "unweighted_gpa",
    sat_score: "sat_score",
    act_score: "act_score",
  };

  for (const [draftField, profileField] of Object.entries(mappings)) {
    const value = source[draftField];
    if (typeof value === "string" && value.trim() !== "") merged[profileField] = value;
    else if (typeof value === "number" && Number.isFinite(value)) merged[profileField] = value;
  }

  // Current signup uses a single GPA field; preserve a separately entered
  // unweighted GPA and only use the generic GPA when unweighted is absent.
  if (!source.unweighted_gpa && source.gpa !== undefined && source.gpa !== null &&
      String(source.gpa).trim() !== "") {
    merged.unweighted_gpa = source.gpa;
  }

  const names = typeof source.full_name === "string" ? source.full_name.trim() : "";
  if (names) {
    const space = names.indexOf(" ");
    merged.first_name = space < 0 ? names : names.slice(0, space);
    merged.last_name = space < 0 ? "" : names.slice(space + 1);
  }

  const schools = source.top_schools;
  if (Array.isArray(schools)) {
    schools.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .slice(0, 9).forEach((value, index) => { merged[`college_list_${index + 2}`] = value; });
  }

  // Never derive identity permissions, verification status, or authorization
  // from user-editable onboarding JSON.
  return merged as T;
}

/**
 * Keep the overlapping legacy editor fields and the saved onboarding snapshot
 * aligned in the SAME profile update. Preserve draft-only fields (activities,
 * supporters, NIL interests, background, etc.) without publishing them.
 */
export function reconcileProfileSave(
  onboardingData: unknown,
  profileUpdates: Record<string, unknown>
): Record<string, unknown> {
  const prior = onboardingData && typeof onboardingData === "object" && !Array.isArray(onboardingData)
    ? onboardingData as Record<string, unknown> : {};
  const next = { ...prior };
  const keys: Record<string, string> = {
    full_name: "full_name", bio: "bio", school: "school", grade: "grade",
    dream_school: "dream_school", school_district: "school_district",
    grad_year: "graduation_year", intended_major: "intended_major",
    sport: "primary_sport", position: "position", travel_team: "current_team",
    highlight_reel_url: "highlight_link", city: "city", zip_code: "zip_code",
    weighted_gpa: "weighted_gpa", unweighted_gpa: "unweighted_gpa",
    sat_score: "sat_score", act_score: "act_score",
  };
  for (const [profileKey, draftKey] of Object.entries(keys)) {
    if (Object.prototype.hasOwnProperty.call(profileUpdates, profileKey)) {
      next[draftKey] = profileUpdates[profileKey];
    }
  }
  // Prevent stale generic GPA from shadowing a newly saved unweighted GPA.
  if (Object.prototype.hasOwnProperty.call(profileUpdates, "unweighted_gpa")) {
    next.gpa = profileUpdates.unweighted_gpa;
  }
  next.top_schools = Array.from({ length: 9 }, (_, i) => profileUpdates[`college_list_${i + 2}`])
    .filter(v => typeof v === "string" && v.trim() !== "");
  return next;
}

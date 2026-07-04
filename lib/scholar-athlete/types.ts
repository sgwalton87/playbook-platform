export type GoverningPath = "ncaa_d1" | "ncaa_d2" | "ncaa_d3" | "naia" | "juco" | "undecided";

export type AthleteProfile = {
  id: string;
  scholarId: string;
  sport: string;
  position?: string;
  secondaryPosition?: string;
  graduationYear: number;
  governingPath: GoverningPath;
  targetSchools: string[];
  highlightUrl?: string;
  recruitingStatus:
    | "exploring"
    | "contacting"
    | "recruited"
    | "offered"
    | "committed";
};

export function buildAthleteProfile(
  input: AthleteProfile
): AthleteProfile {
  return input;
}

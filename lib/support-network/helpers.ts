import {
  StartingFiveRole,
  StartingFiveSlot,
  StartingFiveSummary,
  SupportNetworkMember,
} from "./types";

export const STARTING_FIVE: StartingFiveRole[] = [
  "ParentGuardian",
  "Counselor",
  "Teacher",
  "Mentor",
  "Coach",
];

export function getStartingFiveRoles(
  isScholarAthlete: boolean
): StartingFiveRole[] {
  if (isScholarAthlete) return STARTING_FIVE;

  return [
    "ParentGuardian",
    "Counselor",
    "Teacher",
    "Mentor",
    "TrustedAdult",
  ];
}

export function roleLabel(role: StartingFiveRole): string {
  switch (role) {
    case "ParentGuardian":
      return "Parent / Guardian";

    case "Counselor":
      return "School Counselor";

    case "Teacher":
      return "Teacher";

    case "Mentor":
      return "Mentor";

    case "Coach":
      return "Coach";

    case "TrustedAdult":
      return "Trusted Adult";
  }
}

export function buildStartingFive(
  members: SupportNetworkMember[],
  isScholarAthlete: boolean
): StartingFiveSlot[] {
  return getStartingFiveRoles(isScholarAthlete).map((role) => {
    const member = members.find((m) => m.role === role);

    return {
      role,
      label: roleLabel(role),
      required: role === "ParentGuardian",
      filled: !!member,
      member,
    };
  });
}

export function getStartingFiveSummary(
  members: SupportNetworkMember[],
  isScholarAthlete: boolean
): StartingFiveSummary {
  const slots = buildStartingFive(members, isScholarAthlete);

  const completed = slots.filter((s) => s.filled).length;

  return {
    completed,
    total: slots.length,
    percentage: Math.round((completed / slots.length) * 100),
    slots,
  };
}
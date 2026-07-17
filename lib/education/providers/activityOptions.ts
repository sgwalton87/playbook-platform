export type ActivityCategory =
  | "Academics"
  | "Arts & Creativity"
  | "Athletics"
  | "Career & Work"
  | "Community Service"
  | "Family Responsibilities"
  | "Faith & Community"
  | "Leadership"
  | "School Clubs"
  | "Awards & Recognition"
  | "Other";

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  "Academics",
  "Arts & Creativity",
  "Athletics",
  "Career & Work",
  "Community Service",
  "Family Responsibilities",
  "Faith & Community",
  "Leadership",
  "School Clubs",
  "Awards & Recognition",
  "Other",
];

export const ACTIVITIES_BY_CATEGORY: Record<
  ActivityCategory,
  string[]
> = {
  Academics: [
    "Academic Decathlon",
    "Academic Tutoring",
    "Coding Club",
    "Debate Team",
    "Math Club",
    "Mock Trial",
    "Peer Tutoring",
    "Robotics",
    "Science Fair",
    "Science Olympiad",
    "Speech Team",
    "Student Research",
  ],

  "Arts & Creativity": [
    "Animation",
    "Band",
    "Choir",
    "Creative Writing",
    "Dance",
    "Digital Art",
    "Fashion Design",
    "Film Production",
    "Graphic Design",
    "Music Production",
    "Orchestra",
    "Photography",
    "Theater",
    "Visual Arts",
  ],

  Athletics: [
    "Baseball",
    "Basketball",
    "Cheer",
    "Cross Country",
    "Dance Team",
    "Football",
    "Golf",
    "Gymnastics",
    "Lacrosse",
    "Martial Arts",
    "Soccer",
    "Softball",
    "Swimming",
    "Tennis",
    "Track & Field",
    "Volleyball",
    "Wrestling",
  ],

  "Career & Work": [
    "Apprenticeship",
    "Family Business",
    "Freelance Work",
    "Internship",
    "Job Shadowing",
    "Part-Time Job",
    "Paid Internship",
    "Seasonal Job",
    "Student Business",
    "Work-Based Learning",
  ],

  "Community Service": [
    "Animal Shelter Volunteer",
    "Community Cleanup",
    "Community Garden",
    "Food Bank Volunteer",
    "Fundraising",
    "Hospital Volunteer",
    "Neighborhood Outreach",
    "Nonprofit Volunteer",
    "Peer Mentoring",
    "Political Campaign Volunteer",
    "Senior Center Volunteer",
    "Youth Program Volunteer",
  ],

  "Family Responsibilities": [
    "Caregiving for a Family Member",
    "Childcare for Siblings",
    "Household Management",
    "Interpreting or Translating",
    "Managing Family Appointments",
    "Supporting a Family Business",
    "Transportation Support",
  ],

  "Faith & Community": [
    "Community Ministry",
    "Faith-Based Volunteer Work",
    "Religious Education",
    "Youth Group",
    "Youth Ministry",
    "Worship Arts",
  ],

  Leadership: [
    "Club Founder",
    "Club Officer",
    "Event Organizer",
    "Peer Leader",
    "Student Ambassador",
    "Student Body Officer",
    "Student Government",
    "Team Captain",
    "Youth Advisory Board",
    "Youth Organizer",
  ],

  "School Clubs": [
    "Anime Club",
    "Black Student Union",
    "Book Club",
    "Chess Club",
    "Cultural Club",
    "Environmental Club",
    "Future Business Leaders",
    "Health Careers Club",
    "Key Club",
    "Language Club",
    "LGBTQ+ Student Alliance",
    "National Honor Society",
    "Yearbook",
  ],

  "Awards & Recognition": [
    "Academic Honor",
    "Athletic Award",
    "Community Service Award",
    "Competition Award",
    "Employee Recognition",
    "Honor Roll",
    "Leadership Award",
    "Scholarship Award",
    "Special Recognition",
  ],

  Other: [],
};

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function getActivityOptions(
  category: ActivityCategory | "",
  customActivities: string[] = []
): string[] {
  const official = category
    ? ACTIVITIES_BY_CATEGORY[category] || []
    : [];

  return Array.from(
    new Map(
      [...official, ...customActivities]
        .map(normalize)
        .filter(Boolean)
        .map((activity) => [
          activity.toLowerCase(),
          activity,
        ])
    ).values()
  ).sort((a, b) =>
    a.localeCompare(b, "en", {
      sensitivity: "base",
      numeric: true,
    })
  );
}

export function searchActivities(
  category: ActivityCategory | "",
  query: string,
  customActivities: string[] = [],
  limit = 40
): string[] {
  const clean = query.trim().toLowerCase();
  const options = getActivityOptions(
    category,
    customActivities
  );

  if (!clean) {
    return options.slice(0, limit);
  }

  const exact: string[] = [];
  const startsWith: string[] = [];
  const contains: string[] = [];

  for (const option of options) {
    const normalized = option.toLowerCase();

    if (normalized === clean) {
      exact.push(option);
    } else if (normalized.startsWith(clean)) {
      startsWith.push(option);
    } else if (normalized.includes(clean)) {
      contains.push(option);
    }
  }

  return [
    ...exact,
    ...startsWith,
    ...contains,
  ].slice(0, limit);
}

export const SPORTS_POSITIONS: Record<
  string,
  string[]
> = {
  Baseball: [
    "Pitcher",
    "Catcher",
    "First Base",
    "Second Base",
    "Third Base",
    "Shortstop",
    "Left Field",
    "Center Field",
    "Right Field",
    "Designated Hitter",
    "Utility Player",
    "Team Captain",
  ],

  Basketball: [
    "Point Guard",
    "Shooting Guard",
    "Small Forward",
    "Power Forward",
    "Center",
    "Guard",
    "Forward",
    "Wing",
    "Post",
    "Team Captain",
  ],

  Cheer: [
    "Base",
    "Flyer",
    "Back Spot",
    "Front Spot",
    "Tumbler",
    "Team Captain",
  ],

  "Cross Country": [
    "Distance Runner",
    "Team Captain",
  ],

  "Dance Team": [
    "Dancer",
    "Lead Dancer",
    "Choreographer",
    "Team Captain",
  ],

  Football: [
    "Quarterback",
    "Running Back",
    "Fullback",
    "Wide Receiver",
    "Tight End",
    "Offensive Line",
    "Center",
    "Guard",
    "Tackle",
    "Defensive End",
    "Defensive Tackle",
    "Linebacker",
    "Cornerback",
    "Safety",
    "Kicker",
    "Punter",
    "Long Snapper",
    "Kick Returner",
    "Team Captain",
  ],

  Golf: [
    "Golfer",
    "Team Captain",
  ],

  Gymnastics: [
    "All-Around",
    "Vault",
    "Uneven Bars",
    "Balance Beam",
    "Floor Exercise",
    "Team Captain",
  ],

  Lacrosse: [
    "Attack",
    "Midfield",
    "Defense",
    "Goalkeeper",
    "Faceoff Specialist",
    "Long-Stick Midfielder",
    "Team Captain",
  ],

  "Martial Arts": [
    "Competitor",
    "Forms",
    "Sparring",
    "Instructor",
    "Team Captain",
  ],

  Soccer: [
    "Goalkeeper",
    "Center Back",
    "Fullback",
    "Wing Back",
    "Defensive Midfielder",
    "Central Midfielder",
    "Attacking Midfielder",
    "Winger",
    "Forward",
    "Striker",
    "Team Captain",
  ],

  Softball: [
    "Pitcher",
    "Catcher",
    "First Base",
    "Second Base",
    "Third Base",
    "Shortstop",
    "Left Field",
    "Center Field",
    "Right Field",
    "Designated Player",
    "Utility Player",
    "Team Captain",
  ],

  Swimming: [
    "Freestyle",
    "Backstroke",
    "Breaststroke",
    "Butterfly",
    "Individual Medley",
    "Distance Swimmer",
    "Sprinter",
    "Relay Swimmer",
    "Team Captain",
  ],

  Tennis: [
    "Singles",
    "Doubles",
    "Team Captain",
  ],

  "Track & Field": [
    "Sprinter",
    "Middle-Distance Runner",
    "Distance Runner",
    "Hurdler",
    "Relay Runner",
    "High Jump",
    "Long Jump",
    "Triple Jump",
    "Pole Vault",
    "Shot Put",
    "Discus",
    "Javelin",
    "Team Captain",
  ],

  Volleyball: [
    "Setter",
    "Outside Hitter",
    "Opposite Hitter",
    "Middle Blocker",
    "Libero",
    "Defensive Specialist",
    "Serving Specialist",
    "Team Captain",
  ],

  Wrestling: [
    "Wrestler",
    "Team Captain",
  ],
};

export function getSportPositionOptions(
  sport: string,
  customPositions: string[] = []
): string[] {
  const official =
    SPORTS_POSITIONS[sport] || [];

  return Array.from(
    new Map(
      [...official, ...customPositions]
        .map((position) =>
          position.replace(/\s+/g, " ").trim()
        )
        .filter(Boolean)
        .map((position) => [
          position.toLowerCase(),
          position,
        ])
    ).values()
  ).sort((a, b) =>
    a.localeCompare(b, "en", {
      sensitivity: "base",
      numeric: true,
    })
  );
}

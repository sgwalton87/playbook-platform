export type DesignSchemaStatus = "Current Schema" | "Legacy Schema" | "Special Experience";

export type DesignSchemaRoute = {
  route: string;
  label: string;
  status: DesignSchemaStatus;
  notes: string;
};

export function getDesignSchemaRoutes(): DesignSchemaRoute[] {
  return [
    { route: "/dashboard", label: "Dashboard", status: "Current Schema", notes: "Academic command center." },
    { route: "/transcript", label: "Transcript", status: "Current Schema", notes: "Academic core; verify spacing after upload recovery." },
    { route: "/start", label: "Start Here", status: "Current Schema", notes: "Live journey progress." },
    { route: "/compass", label: "Compass", status: "Current Schema", notes: "Action-plan surface." },
    { route: "/feed", label: "Community Feed", status: "Current Schema", notes: "Recently unified; verify post cards and comments." },
    { route: "/albums", label: "Albums", status: "Current Schema", notes: "Live album foundation." },
    { route: "/mentor-connect", label: "Mentor Connect", status: "Current Schema", notes: "Matches current Playbook hero/card schema." },
    { route: "/community-events", label: "Community Events", status: "Current Schema", notes: "Live event foundation." },
    { route: "/courses", label: "Courses", status: "Current Schema", notes: "Library page updated; detail page next." },
    { route: "/courses/[slug]", label: "Course Detail", status: "Current Schema", notes: "Uses CourseDetailHeader and preserves course progress, rewards, certificates, and modules." },
    { route: "/u/[username]", label: "Public Profile", status: "Special Experience", notes: "Profile/story surface; should be branded but can have richer custom layout." },
    { route: "/demo", label: "Founder Demo", status: "Special Experience", notes: "Investor/district storytelling mode." },
    { route: "/admin/moderation", label: "Moderation", status: "Current Schema", notes: "Trust queue." },
  ];
}

export function summarizeDesignSchema() {
  return getDesignSchemaRoutes().reduce(
    (summary, route) => {
      summary[route.status] += 1;
      return summary;
    },
    {
      "Current Schema": 0,
      "Legacy Schema": 0,
      "Special Experience": 0,
    }
  );
}

export function getLegacyDesignRoutes() {
  return getDesignSchemaRoutes().filter((route) => route.status === "Legacy Schema");
}

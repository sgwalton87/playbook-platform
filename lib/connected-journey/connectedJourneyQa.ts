export type JourneyStatus = "pass" | "watch" | "needs_fix";

export type ConnectedJourneyCheck = {
  id: string;
  label: string;
  route: string;
  layer: "academic" | "social" | "support" | "opportunity" | "economy" | "trust" | "demo" | "shell";
  status: JourneyStatus;
  expectation: string;
};

export function getConnectedJourneyChecks(): ConnectedJourneyCheck[] {
  return [
    {
      id: "dashboard",
      label: "Dashboard",
      route: "/dashboard",
      layer: "academic",
      status: "watch",
      expectation: "Dashboard centers transcript upload, live A-G tracker, Compass, support network, and community.",
    },
    {
      id: "transcript",
      label: "Transcript Upload + A-G",
      route: "/transcript",
      layer: "academic",
      status: "pass",
      expectation: "Transcript upload parses courses/grades and updates ag_progress.",
    },
    {
      id: "start",
      label: "Start Here",
      route: "/start",
      layer: "academic",
      status: "pass",
      expectation: "Progress updates from live A-G and scholar activity.",
    },
    {
      id: "compass",
      label: "Compass",
      route: "/compass",
      layer: "academic",
      status: "watch",
      expectation: "Compass turns A-G gaps into action steps.",
    },
    {
      id: "feed",
      label: "Community Feed",
      route: "/feed",
      layer: "social",
      status: "watch",
      expectation: "Posts, photos, likes, comments, edit/delete, rewards, and safety controls persist.",
    },
    {
      id: "albums",
      label: "Profile Albums",
      route: "/albums",
      layer: "social",
      status: "watch",
      expectation: "Albums and user-scoped photos persist.",
    },
    {
      id: "mentor-connect",
      label: "Mentor Connect",
      route: "/mentor-connect",
      layer: "support",
      status: "watch",
      expectation: "Searches searchable support directory without exposing private scholar data.",
    },
    {
      id: "events",
      label: "Community Events",
      route: "/community-events",
      layer: "social",
      status: "watch",
      expectation: "Events persist, RSVPs persist, and RSVP rewards are deduped.",
    },
    {
      id: "courses",
      label: "Courses",
      route: "/courses",
      layer: "economy",
      status: "watch",
      expectation: "Course progress connects to certificates, rewards, and profile story.",
    },
    {
      id: "rewards",
      label: "Reward Economy",
      route: "/reward-economy",
      layer: "economy",
      status: "watch",
      expectation: "Coin ledger reflects verified scholar actions once.",
    },
    {
      id: "profile",
      label: "Public Profile",
      route: "/u/demo",
      layer: "social",
      status: "watch",
      expectation: "Profile shows story, posts, albums, certificates, badges, and scholar record.",
    },
    {
      id: "founder-demo",
      label: "Founder Demo",
      route: "/demo",
      layer: "demo",
      status: "pass",
      expectation: "Demo Mode routes to Stephisha Founder Case Study.",
    },
    {
      id: "moderation",
      label: "Moderation",
      route: "/admin/moderation",
      layer: "trust",
      status: "watch",
      expectation: "Founder/Admin can review reported content.",
    },
  ];
}

export function summarizeConnectedJourney() {
  const checks = getConnectedJourneyChecks();

  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { pass: 0, watch: 0, needs_fix: 0 }
  );
}

export function getManualQaPathway() {
  return [
    "/dashboard",
    "/transcript",
    "/start",
    "/compass",
    "/feed",
    "/albums",
    "/mentor-connect",
    "/community-events",
    "/courses",
    "/reward-economy",
    "/demo",
    "/admin/moderation",
  ];
}
